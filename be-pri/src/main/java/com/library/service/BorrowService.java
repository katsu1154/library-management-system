package com.library.service;

import com.library.dto.BorrowDetailDTO;
import com.library.dto.BorrowRequest;
import com.library.dto.RenewRequest;
import com.library.dto.ReturnRequest;
import com.library.dto.ViolationRequest;
import com.library.entity.*;
import com.library.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
public class BorrowService {

    @Autowired
    private BorrowTicketRepository borrowTicketRepository;

    @Autowired
    private BookCopyRepository bookCopyRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private ViolationService violationService;

    @Autowired
    private com.library.repository.ViolationRepository violationRepository;

    @Autowired
    private ShelfRepository shelfRepository;

    @Autowired
    private EmailService emailService;

    public List<BorrowTicket> getAll() {
        return borrowTicketRepository.findAll();
    }

    public List<BorrowTicket> getMyTickets(Long userId) {
        return borrowTicketRepository.findByUserId(userId);
    }

    @Transactional
    public BorrowTicket reserveBook(BorrowRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new RuntimeException("Book not found!"));

        BigDecimal deposit = BigDecimal.ZERO;
        Wallet wallet = null;
        String borrowCode = "BR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // 1. Kiểm tra số dư nếu External (chưa trừ tiền)
        if (user.getRole() == RoleType.ROLE_EXTERNAL_READER) {
            wallet = walletRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Chưa có ví điện tử!"));
            deposit = book.getPrice();
            if (wallet.getBalance().compareTo(deposit) < 0) {
                throw new RuntimeException("Số dư ví không đủ để cọc tiền sách!");
            }
        }

        // 2. Tìm BookCopy
        BookCopy copy = bookCopyRepository.findFirstByBookIdAndStatus(book.getId(), CopyStatus.AVAILABLE)
                .orElseThrow(() -> new RuntimeException("Rất tiếc, sách này hiện không còn cuốn nào trống!"));

        copy.setStatus(CopyStatus.RESERVED);
        bookCopyRepository.save(copy);

        // 3. Lưu Ticket trước để có ID
        BorrowTicket ticket = new BorrowTicket();
        ticket.setUser(user);
        ticket.setBookCopy(copy);
        ticket.setBorrowCode(borrowCode);
        ticket.setStatus(BorrowStatus.PENDING_PICKUP);
        ticket.setBorrowDate(LocalDateTime.now());
        ticket.setPickupDeadline(LocalDateTime.now().plusHours(24));
        ticket.setDepositAmount(deposit);
        ticket = borrowTicketRepository.save(ticket);

        // 4. Trừ cọc & ghi transaction (có borrowTicketId)
        if (wallet != null && deposit.compareTo(BigDecimal.ZERO) > 0) {
            wallet.setBalance(wallet.getBalance().subtract(deposit));
            walletRepository.save(wallet);
            Transaction tx = new Transaction(wallet, deposit, TransactionType.WITHDRAWAL,
                    "Tiền cọc mượn sách [" + borrowCode + "]: " + book.getTitle(), ticket.getId());
            transactionRepository.save(tx);
        }

        return ticket;
    }

    @Transactional
    public BorrowTicket pickupBook(String borrowCode) {
        BorrowTicket ticket = borrowTicketRepository.findByBorrowCode(borrowCode)
                .orElseThrow(() -> new RuntimeException("Mã mượn sách không tồn tại!"));

        if (ticket.getStatus() != BorrowStatus.PENDING_PICKUP) {
            throw new RuntimeException("Phiếu không ở trạng thái chờ lấy!");
        }

        if (LocalDateTime.now().isAfter(ticket.getPickupDeadline())) {
            throw new RuntimeException("Phiếu đã quá hạn 24h, vui lòng đặt lại!");
        }

        User user = ticket.getUser();
        Book book = ticket.getBookCopy().getBook();

        // Thu phí mượn 21% (7 ngày * 3%) nếu là EXTERNAL
        if (user.getRole() == RoleType.ROLE_EXTERNAL_READER) {
            Wallet wallet = walletRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Chưa có ví điện tử!"));

            BigDecimal fee = book.getPrice().multiply(BigDecimal.valueOf(0.21));

            // +2% nếu độc giả có >= 5 vi phạm
            long violationCount = violationRepository.countByUserId(user.getId());
            if (violationCount >= 5) {
                fee = fee.add(book.getPrice().multiply(BigDecimal.valueOf(0.02)));
            }

            if (wallet.getBalance().compareTo(fee) < 0) {
                throw new RuntimeException("Ví không đủ tiền trả phí mượn. Hãy nạp thêm!");
            }

            wallet.setBalance(wallet.getBalance().subtract(fee));
            walletRepository.save(wallet);

            String feeNote = violationCount >= 5
                    ? "Phí mượn sách 7 ngày (+2% do vi phạm) [" + ticket.getBorrowCode() + "]: " + book.getTitle()
                    : "Phí mượn sách 7 ngày [" + ticket.getBorrowCode() + "]: " + book.getTitle();
            Transaction tx = new Transaction(wallet, fee, TransactionType.WITHDRAWAL, feeNote, ticket.getId());
            transactionRepository.save(tx);
        }

        ticket.setStatus(BorrowStatus.BORROWED);
        ticket.setPickupDate(LocalDateTime.now());
        ticket.setDueDate(LocalDateTime.now().plusDays(7));

        // Giải phóng Capacity trên Kệ
        BookCopy copy = ticket.getBookCopy();
        copy.setStatus(CopyStatus.BORROWED);
        Shelf shelf = book.getShelf();
        shelf.setCurrentCapacity(Math.max(0, shelf.getCurrentCapacity() - 1));
        shelfRepository.save(shelf);

        bookCopyRepository.save(copy);
        return borrowTicketRepository.save(ticket);
    }

    @Transactional
    public BorrowTicket renewBook(Long ticketId, RenewRequest req, Long userId) {
        BorrowTicket ticket = borrowTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu mượn!"));

        if (!ticket.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền gia hạn phiếu này!");
        }

        if (ticket.getStatus() != BorrowStatus.BORROWED) {
            throw new RuntimeException("Chỉ có thể gia hạn khi đang mượn!");
        }

        if (ticket.getRenewCount() >= 2) {
            throw new RuntimeException("Đã đạt giới hạn 2 lần gia hạn!");
        }

        Book book = ticket.getBookCopy().getBook();

        // Thu phí nếu EXTERNAL
        if (ticket.getUser().getRole() == RoleType.ROLE_EXTERNAL_READER) {
            Wallet wallet = walletRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Chưa có ví điện tử!"));
            BigDecimal fee = book.getPrice().multiply(BigDecimal.valueOf(req.getExtraDays() * 0.03));

            if (wallet.getBalance().compareTo(fee) < 0) {
                throw new RuntimeException("Số dư không đủ trả phí gia hạn!");
            }

            wallet.setBalance(wallet.getBalance().subtract(fee));
            walletRepository.save(wallet);

            Transaction tx = new Transaction(wallet, fee, TransactionType.WITHDRAWAL, "Phí gia hạn " + req.getExtraDays() + " ngày [" + ticket.getBorrowCode() + "]: " + book.getTitle(), ticket.getId());
            transactionRepository.save(tx);
        }

        ticket.setDueDate(ticket.getDueDate().plusDays(req.getExtraDays()));
        ticket.setRenewCount(ticket.getRenewCount() + 1);

        return borrowTicketRepository.save(ticket);
    }

    @Transactional
    public BorrowTicket returnBook(String borrowCode, ReturnRequest req) {
        BorrowTicket ticket = borrowTicketRepository.findByBorrowCode(borrowCode)
                .orElseThrow(() -> new RuntimeException("Mã mượn không tồn tại!"));

        if (ticket.getStatus() != BorrowStatus.BORROWED) {
            throw new RuntimeException("Phiếu này không ở trạng thái đang mượn!");
        }

        LocalDateTime now = LocalDateTime.now();
        ticket.setReturnDate(now);
        User user = ticket.getUser();
        BookCopy copy = ticket.getBookCopy();
        Book book = copy.getBook();
        Wallet wallet = walletRepository.findByUserId(user.getId()).orElse(null);

        // ================================================================
        // BƯỚC 1: HOÀN TIỀN (CỌC & PHÍ DƯ) VÀO VÍ TRƯỚC KHI TÍNH PHẠT
        // ================================================================
        
        // 1A. Hoàn tiền Cọc (External)
        if (ticket.getDepositAmount().compareTo(BigDecimal.ZERO) > 0 && wallet != null) {
            wallet.setBalance(wallet.getBalance().add(ticket.getDepositAmount()));
            walletRepository.save(wallet); // Lưu ngay để ví "phình to" ra
            Transaction tx = new Transaction(wallet, ticket.getDepositAmount(), TransactionType.REFUND, "Hoàn cọc sách [" + borrowCode + "]: " + book.getTitle(), ticket.getId());
            transactionRepository.save(tx);
        }

        // 1B. Hoàn phí mượn dư (Nếu trả sớm)
        if (user.getRole() == RoleType.ROLE_EXTERNAL_READER && now.isBefore(ticket.getDueDate()) && wallet != null) {
            long unusedDays = ChronoUnit.DAYS.between(now, ticket.getDueDate());
            if (unusedDays > 0) {
                BigDecimal refundFee = book.getPrice().multiply(BigDecimal.valueOf(unusedDays * 0.03));
                wallet.setBalance(wallet.getBalance().add(refundFee));
                walletRepository.save(wallet);
                Transaction tx2 = new Transaction(wallet, refundFee, TransactionType.REFUND, "Hoàn phí mượn chưa dùng (" + unusedDays + " ngày) [" + borrowCode + "]", ticket.getId());
                transactionRepository.save(tx2);
            }
        }

        // ================================================================
        // BƯỚC 2: TÍNH PHẠT (Lúc này ví đã có tiền cọc nên sẽ tự động trừ thành công)
        // ================================================================

        // 2A. Tính Phạt Quá Hạn
        if (now.isAfter(ticket.getDueDate())) {
            long daysLate = ChronoUnit.DAYS.between(ticket.getDueDate(), now);
            if (daysLate > 0) {
                BigDecimal fine = book.getPrice().multiply(BigDecimal.valueOf(daysLate * 0.05));
                createAutoViolation(user, ViolationType.LATE_RETURN, fine, "Phạt trễ " + daysLate + " ngày [" + borrowCode + "].", book.getPrice(), ticket.getId());
            }
        }

        // 2B. Tính Phạt Hỏng hóc
        int damageDiff = req.getReportedDamagePercent() - copy.getDamagePercent();
        if (damageDiff > 0) {
            if (req.getReportedDamagePercent() >= 50) {
                createAutoViolation(user, ViolationType.LOST_BOOK, book.getPrice(), "Sách hỏng nặng > 50% (Tính như Mất sách) [" + borrowCode + "].", book.getPrice(), ticket.getId());
                copy.setStatus(CopyStatus.LOST);
            } else {
                BigDecimal fine = book.getPrice().multiply(BigDecimal.valueOf(damageDiff / 100.0));
                createAutoViolation(user, ViolationType.DAMAGED_BOOK, fine, "Sách hỏng " + damageDiff + "% [" + borrowCode + "].", book.getPrice(), ticket.getId());
                copy.setStatus(CopyStatus.DAMAGED);
            }
        } else {
            copy.setStatus(CopyStatus.AVAILABLE);
        }
        copy.setDamagePercent(req.getReportedDamagePercent());

        // Nếu AVAILABLE thì Kệ sách chiếm lại không gian
        if (copy.getStatus() == CopyStatus.AVAILABLE) {
            Shelf shelf = book.getShelf();
            if (shelf.getCurrentCapacity() < shelf.getMaxCapacity()) {
                shelf.setCurrentCapacity(shelf.getCurrentCapacity() + 1);
                shelfRepository.save(shelf);
            }
        }
        bookCopyRepository.save(copy);

        ticket.setStatus(BorrowStatus.RETURNED);
        return borrowTicketRepository.save(ticket);
    }

    @Transactional
    public BorrowTicket cancelReservation(Long ticketId, Long userId) {
        BorrowTicket ticket = borrowTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu mượn!"));

        if (!ticket.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền hủy phiếu này!");
        }

        if (ticket.getStatus() != BorrowStatus.PENDING_PICKUP) {
            throw new RuntimeException("Chỉ có thể hủy khi phiếu đang ở trạng thái chờ lấy sách!");
        }

        User user = ticket.getUser();
        BookCopy copy = ticket.getBookCopy();
        Book book = copy.getBook();

        // 1. Phạt huỷ đặt chỗ: 10% giá sách (giống auto-cancel sau 24h)
        BigDecimal fine = book.getPrice().multiply(BigDecimal.valueOf(0.10));
        createAutoViolation(user, ViolationType.NOT_PICKED_UP, fine,
                "Tự huỷ đặt chỗ sách [" + ticket.getBorrowCode() + "]: " + book.getTitle(), book.getPrice(), ticket.getId());

        // 2. Hoàn cọc (chỉ External Reader mới có cọc)
        if (ticket.getDepositAmount().compareTo(BigDecimal.ZERO) > 0) {
            Wallet wallet = walletRepository.findByUserId(user.getId()).orElse(null);
            if (wallet != null) {
                wallet.setBalance(wallet.getBalance().add(ticket.getDepositAmount()));
                walletRepository.save(wallet);
                Transaction tx = new Transaction(wallet, ticket.getDepositAmount(),
                        TransactionType.REFUND, "Hoàn cọc sách (huỷ đặt chỗ) [" + ticket.getBorrowCode() + "]: " + book.getTitle(), ticket.getId());
                transactionRepository.save(tx);
            }
        }

        // 3. Cập nhật trạng thái — shelf capacity không đổi (chưa giảm lúc reserve)
        ticket.setStatus(BorrowStatus.CANCELED);
        copy.setStatus(CopyStatus.AVAILABLE);
        bookCopyRepository.save(copy);

        return borrowTicketRepository.save(ticket);
    }

    public void remindOverdueTicket(String borrowCode) {
        BorrowTicket ticket = borrowTicketRepository.findByBorrowCode(borrowCode)
                .orElseThrow(() -> new RuntimeException("Mã mượn không tồn tại!"));

        if (ticket.getStatus() != BorrowStatus.BORROWED) {
            throw new RuntimeException("Phiếu này không ở trạng thái đang mượn!");
        }

        LocalDateTime now = LocalDateTime.now();
        if (!now.isAfter(ticket.getDueDate())) {
            throw new RuntimeException("Phiếu này chưa đến hạn trả!");
        }

        long daysLate = ChronoUnit.DAYS.between(ticket.getDueDate(), now);
        
        emailService.sendOverdueReminder(
            ticket.getUser().getEmail(), 
            ticket.getUser().getFullName(), 
            ticket.getBookCopy().getBook().getTitle(), 
            daysLate
        );
    }

    @Transactional(readOnly = true)
    public BorrowDetailDTO getTicketDetail(Long ticketId) {
        BorrowTicket ticket = borrowTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu mượn!"));

        Long userId = ticket.getUser().getId();
        String borrowCode = ticket.getBorrowCode();

        // Lấy vi phạm: kết hợp FK và description để không bỏ sót dữ liệu cũ
        java.util.List<com.library.entity.Violation> violations =
                violationRepository.findByBorrowTicketIdOrUserAndBorrowCode(ticketId, userId, borrowCode);

        // Lấy giao dịch: kết hợp FK và description để không bỏ sót dữ liệu cũ
        java.util.List<com.library.entity.Transaction> transactions = java.util.Collections.emptyList();
        java.util.Optional<com.library.entity.Wallet> wallet = walletRepository.findByUserId(userId);
        if (wallet.isPresent()) {
            transactions = transactionRepository.findByWalletAndBorrowTicketOrCode(wallet.get().getId(), ticketId, borrowCode);
        }

        return new BorrowDetailDTO(ticket, violations, transactions);
    }

    private void createAutoViolation(User user, ViolationType type, BigDecimal fineAmount, String desc, BigDecimal bookPrice, Long borrowTicketId) {
        ViolationRequest vReq = new ViolationRequest();
        vReq.setUserId(user.getId());
        vReq.setViolationType(type);
        vReq.setFineAmount(fineAmount);
        vReq.setDescription(desc);
        vReq.setBookPrice(bookPrice);
        vReq.setBorrowTicketId(borrowTicketId);
        violationService.createViolation(vReq);
    }
}

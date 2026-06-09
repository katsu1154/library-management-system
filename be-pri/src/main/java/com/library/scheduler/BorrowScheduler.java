package com.library.scheduler;

import com.library.entity.*;
import com.library.repository.BookCopyRepository;
import com.library.repository.BorrowTicketRepository;
import com.library.repository.TransactionRepository;
import com.library.repository.WalletRepository;
import com.library.service.ViolationService;
import com.library.dto.ViolationRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class BorrowScheduler {

    @Autowired
    private BorrowTicketRepository borrowTicketRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private BookCopyRepository bookCopyRepository;

    @Autowired
    private ViolationService violationService;

    // Chạy mỗi giờ
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void checkExpiredPickups() {
        LocalDateTime now = LocalDateTime.now();
        List<BorrowTicket> pendingTickets = borrowTicketRepository.findByStatus(BorrowStatus.PENDING_PICKUP);

        for (BorrowTicket ticket : pendingTickets) {
            if (now.isAfter(ticket.getPickupDeadline())) {
                User user = ticket.getUser();
                BookCopy copy = ticket.getBookCopy();
                Book book = copy.getBook();

                BigDecimal fine = book.getPrice().multiply(BigDecimal.valueOf(0.10));
                ViolationRequest vReq = new ViolationRequest();
                vReq.setUserId(user.getId());
                vReq.setViolationType(ViolationType.NOT_PICKED_UP);
                vReq.setFineAmount(fine);
                vReq.setDescription("Quá hạn 24h không lấy sách [" + ticket.getBorrowCode() + "]: " + book.getTitle());
                vReq.setBorrowTicketId(ticket.getId());
                violationService.createViolation(vReq);

                if (ticket.getDepositAmount().compareTo(BigDecimal.ZERO) > 0) {
                    Wallet wallet = walletRepository.findByUserId(user.getId()).orElse(null);
                    if (wallet != null) {
                        wallet.setBalance(wallet.getBalance().add(ticket.getDepositAmount()));
                        walletRepository.save(wallet);

                        Transaction tx = new Transaction(wallet, ticket.getDepositAmount(), TransactionType.REFUND, "Hoàn cọc sách (hủy do quá hạn) [" + ticket.getBorrowCode() + "]: " + book.getTitle(), ticket.getId());
                        transactionRepository.save(tx);
                    }
                }

                ticket.setStatus(BorrowStatus.CANCELED);
                copy.setStatus(CopyStatus.AVAILABLE);

                borrowTicketRepository.save(ticket);
                bookCopyRepository.save(copy);
            }
        }
    }
}

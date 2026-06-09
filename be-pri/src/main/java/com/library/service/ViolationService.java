package com.library.service;

import com.library.dto.ViolationRequest;
import com.library.entity.*;
import com.library.repository.NotificationRepository;
import com.library.repository.UserRepository;
import com.library.repository.ViolationRepository;
import com.library.repository.WalletRepository;
import com.library.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ViolationService {

    @Autowired
    private ViolationRepository violationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private EmailService emailService;

    public List<Violation> getAllViolations() {
        return violationRepository.findAll();
    }

    public List<Violation> getViolationsByUserId(Long userId) {
        return violationRepository.findByUserId(userId);
    }

    public List<Violation> getUnpaidViolationsByUserId(Long userId) {
        return violationRepository.findByUserIdAndStatus(userId, ViolationStatus.UNPAID);
    }

    public Violation getById(Long id) {
        return violationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Violation not found!"));
    }

    @Transactional
    public Violation createViolation(ViolationRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found!"));

        long existingCount = violationRepository.countByUserId(user.getId());

        // +2% giá sách nếu đã có >= 5 vi phạm trước đó
        java.math.BigDecimal fineAmount = request.getFineAmount();
        if (existingCount >= 5 && request.getBookPrice() != null) {
            fineAmount = fineAmount.add(request.getBookPrice().multiply(java.math.BigDecimal.valueOf(0.02)));
        }

        Violation violation = new Violation();
        violation.setUser(user);
        violation.setViolationType(request.getViolationType());
        violation.setFineAmount(fineAmount);
        violation.setDescription(request.getDescription());
        violation.setStatus(ViolationStatus.UNPAID);
        violation.setBorrowTicketId(request.getBorrowTicketId());

        // Cố gắng tự động trừ tiền
        Wallet wallet = walletRepository.findByUserId(user.getId()).orElse(null);
        if (wallet != null && wallet.getBalance().compareTo(fineAmount) >= 0) {
            wallet.setBalance(wallet.getBalance().subtract(fineAmount));
            walletRepository.save(wallet);

            Transaction transaction = new Transaction(wallet, fineAmount, TransactionType.PENALTY, "Phí vi phạm: " + request.getDescription(), request.getBorrowTicketId());
            transactionRepository.save(transaction);

            violation.setStatus(ViolationStatus.PAID);
            violation.setPaidAt(LocalDateTime.now());
        }

        Violation saved = violationRepository.save(violation);

        // Ban nếu tổng vi phạm đạt >= 10
        if (existingCount + 1 >= 10) {
            user.setEnabled(false);
            userRepository.save(user);
        }

        return saved;
    }

    @Transactional
    public Violation payViolation(Long violationId, Long userId) {
        Violation violation = getById(violationId);

        if (!violation.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền thanh toán vi phạm này!");
        }

        if (violation.getStatus() == ViolationStatus.PAID) {
            throw new RuntimeException("Vi phạm này đã được thanh toán!");
        }

        Wallet wallet = walletRepository.findByUserId(userId).orElse(null);
        if (wallet == null) {
            throw new RuntimeException("Người dùng chưa có ví điện tử!");
        }

        if (wallet.getBalance().compareTo(violation.getFineAmount()) < 0) {
            throw new RuntimeException("Số dư ví không đủ để thanh toán tiền phạt!");
        }

        wallet.setBalance(wallet.getBalance().subtract(violation.getFineAmount()));
        walletRepository.save(wallet);

        Transaction transaction = new Transaction(wallet, violation.getFineAmount(), TransactionType.PENALTY, "Phí vi phạm: " + violation.getDescription(), violation.getBorrowTicketId());
        transactionRepository.save(transaction);

        violation.setStatus(ViolationStatus.PAID);
        violation.setPaidAt(LocalDateTime.now());

        return violationRepository.save(violation);
    }

    public void deleteViolation(Long id) {
        Violation violation = getById(id);
        violationRepository.delete(violation);
    }

    @Transactional
    public void remindViolation(Long violationId) {
        Violation violation = getById(violationId);
        if (violation.getStatus() == ViolationStatus.PAID) {
            throw new RuntimeException("Vi phạm này đã được thanh toán!");
        }
        User user = violation.getUser();

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle("Nhắc nhở: Vi phạm chưa thanh toán");
        notification.setMessage("Bạn có khoản phạt " + violation.getFineAmount().toPlainString()
                + "đ (loại: " + violation.getViolationType().name() + ") chưa được thanh toán. Vui lòng thanh toán sớm để tránh bị hạn chế tài khoản.");
        notificationRepository.save(notification);

        try {
            emailService.sendViolationReminder(
                    user.getEmail(),
                    user.getFullName(),
                    violation.getViolationType().name(),
                    violation.getFineAmount()
            );
        } catch (Exception ignored) {}
    }
}

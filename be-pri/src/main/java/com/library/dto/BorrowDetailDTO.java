package com.library.dto;

import com.library.entity.BorrowTicket;
import com.library.entity.Transaction;
import com.library.entity.Violation;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class BorrowDetailDTO {

    private BorrowTicket ticket;
    private List<ViolationInfo> violations;
    private List<TransactionInfo> transactions;

    public BorrowDetailDTO(BorrowTicket ticket, List<Violation> violations, List<Transaction> transactions) {
        this.ticket = ticket;
        this.violations = violations.stream().map(ViolationInfo::from).collect(Collectors.toList());
        this.transactions = transactions.stream().map(TransactionInfo::from).collect(Collectors.toList());
    }

    public BorrowTicket getTicket() { return ticket; }
    public List<ViolationInfo> getViolations() { return violations; }
    public List<TransactionInfo> getTransactions() { return transactions; }

    // ── Flat DTOs — no JPA entities, no lazy loading ───────────────────────

    public static class ViolationInfo {
        public Long id;
        public String violationType;
        public BigDecimal fineAmount;
        public String description;
        public String status;
        public LocalDateTime createdAt;
        public LocalDateTime paidAt;

        public static ViolationInfo from(Violation v) {
            ViolationInfo dto = new ViolationInfo();
            dto.id = v.getId();
            dto.violationType = v.getViolationType().name();
            dto.fineAmount = v.getFineAmount();
            dto.description = v.getDescription();
            dto.status = v.getStatus().name();
            dto.createdAt = v.getCreatedAt();
            dto.paidAt = v.getPaidAt();
            return dto;
        }
    }

    public static class TransactionInfo {
        public Long id;
        public BigDecimal amount;
        public String type;
        public String description;
        public LocalDateTime createdAt;

        public static TransactionInfo from(Transaction t) {
            TransactionInfo dto = new TransactionInfo();
            dto.id = t.getId();
            dto.amount = t.getAmount();
            dto.type = t.getType().name();
            dto.description = t.getDescription();
            dto.createdAt = t.getCreatedAt();
            return dto;
        }
    }
}

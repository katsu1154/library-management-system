package com.library.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Wallet wallet;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private TransactionType type;

    @Column(length = 255)
    private String description;

    @Column(name = "borrow_ticket_id")
    private Long borrowTicketId;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public Transaction() {}

    public Transaction(Wallet wallet, BigDecimal amount, TransactionType type, String description) {
        this.wallet = wallet;
        this.amount = amount;
        this.type = type;
        this.description = description;
        this.createdAt = LocalDateTime.now();
    }

    public Transaction(Wallet wallet, BigDecimal amount, TransactionType type, String description, Long borrowTicketId) {
        this(wallet, amount, type, description);
        this.borrowTicketId = borrowTicketId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Wallet getWallet() { return wallet; }
    public void setWallet(Wallet wallet) { this.wallet = wallet; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public TransactionType getType() { return type; }
    public void setType(TransactionType type) { this.type = type; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getBorrowTicketId() { return borrowTicketId; }
    public void setBorrowTicketId(Long borrowTicketId) { this.borrowTicketId = borrowTicketId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

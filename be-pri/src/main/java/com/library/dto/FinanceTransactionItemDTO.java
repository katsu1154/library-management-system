package com.library.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class FinanceTransactionItemDTO {
    private LocalDateTime date;
    private String description;
    private String type; // "INCOME" or "EXPENSE"
    private BigDecimal amount;

    public FinanceTransactionItemDTO() {}

    public FinanceTransactionItemDTO(LocalDateTime date, String description, String type, BigDecimal amount) {
        this.date = date;
        this.description = description;
        this.type = type;
        this.amount = amount;
    }

    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
}

package com.library.dto;

import java.math.BigDecimal;

public class DepositRequestDTO {
    private Long userId;
    private BigDecimal amount;
    private String note;

    public DepositRequestDTO() {}

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}

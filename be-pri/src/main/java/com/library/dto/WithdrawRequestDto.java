package com.library.dto;
import java.math.BigDecimal;
public class WithdrawRequestDto {
    private BigDecimal amount;
    private String description;
    public WithdrawRequestDto() {}
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}

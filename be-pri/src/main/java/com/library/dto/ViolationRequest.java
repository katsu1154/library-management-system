package com.library.dto;

import com.library.entity.ViolationType;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class ViolationRequest {
    @NotNull
    private Long userId;

    @NotNull
    private ViolationType violationType;

    @NotNull
    private BigDecimal fineAmount;

    private String description;

    private BigDecimal bookPrice;

    private Long borrowTicketId;

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public ViolationType getViolationType() { return violationType; }
    public void setViolationType(ViolationType violationType) { this.violationType = violationType; }
    public BigDecimal getFineAmount() { return fineAmount; }
    public void setFineAmount(BigDecimal fineAmount) { this.fineAmount = fineAmount; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getBookPrice() { return bookPrice; }
    public void setBookPrice(BigDecimal bookPrice) { this.bookPrice = bookPrice; }
    public Long getBorrowTicketId() { return borrowTicketId; }
    public void setBorrowTicketId(Long borrowTicketId) { this.borrowTicketId = borrowTicketId; }
}

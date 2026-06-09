package com.library.dto;

import java.math.BigDecimal;

public class ImportRequestDTO {
    private Long bookId;
    private Integer quantity;
    private BigDecimal unitPrice;

    public ImportRequestDTO() {}

    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
}

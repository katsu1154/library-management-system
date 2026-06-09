package com.library.dto;

import java.math.BigDecimal;

public class ApproveImportRequestDTO {
    private BigDecimal actualCost;
    private String invoiceNumber;

    public ApproveImportRequestDTO() {}

    public BigDecimal getActualCost() { return actualCost; }
    public void setActualCost(BigDecimal actualCost) { this.actualCost = actualCost; }
    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }
}

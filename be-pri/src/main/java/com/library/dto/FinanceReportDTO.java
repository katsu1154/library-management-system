package com.library.dto;

import java.math.BigDecimal;

import java.util.List;

public class FinanceReportDTO {
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal profit;
    private List<FinanceTransactionItemDTO> transactions;

    public FinanceReportDTO() {}

    public FinanceReportDTO(BigDecimal totalIncome, BigDecimal totalExpense, BigDecimal profit, List<FinanceTransactionItemDTO> transactions) {
        this.totalIncome = totalIncome;
        this.totalExpense = totalExpense;
        this.profit = profit;
        this.transactions = transactions;
    }

    public BigDecimal getTotalIncome() { return totalIncome; }
    public void setTotalIncome(BigDecimal totalIncome) { this.totalIncome = totalIncome; }
    public BigDecimal getTotalExpense() { return totalExpense; }
    public void setTotalExpense(BigDecimal totalExpense) { this.totalExpense = totalExpense; }
    public BigDecimal getProfit() { return profit; }
    public void setProfit(BigDecimal profit) { this.profit = profit; }
    public List<FinanceTransactionItemDTO> getTransactions() { return transactions; }
    public void setTransactions(List<FinanceTransactionItemDTO> transactions) { this.transactions = transactions; }
}

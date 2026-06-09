package com.library.dto;

import java.math.BigDecimal;

public class WalletAdminDTO {
    private Long walletId;
    private String loginName;
    private String fullName;
    private String status;
    private BigDecimal balance;

    public WalletAdminDTO(Long walletId, String loginName, String fullName, String status, BigDecimal balance) {
        this.walletId = walletId;
        this.loginName = loginName;
        this.fullName = fullName;
        this.status = status;
        this.balance = balance;
    }

    public Long getWalletId() { return walletId; }
    public void setWalletId(Long walletId) { this.walletId = walletId; }
    public String getLoginName() { return loginName; }
    public void setLoginName(String loginName) { this.loginName = loginName; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }
}

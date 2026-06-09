package com.library.service;

import com.library.dto.WalletAdminDTO;
import com.library.entity.*;
import com.library.repository.TransactionRepository;
import com.library.repository.UserRepository;
import com.library.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class WalletService {

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    public Wallet getMyWallet(Long userId) {
        return walletRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found"));
                    Wallet newWallet = new Wallet(user);
                    return walletRepository.save(newWallet);
                });
    }

    public List<Transaction> getMyTransactions(Long userId) {
        Wallet wallet = getMyWallet(userId);
        return transactionRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId());
    }

    @Transactional
    public void withdraw(Long userId, BigDecimal amount, String bankInfo) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Số tiền phải lớn hơn 0");
        }
        Wallet wallet = getMyWallet(userId);
        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Số dư không đủ để rút");
        }
        wallet.setBalance(wallet.getBalance().subtract(amount));
        walletRepository.save(wallet);
        Transaction tx = new Transaction(wallet, amount.negate(), TransactionType.WITHDRAWAL, "Rút tiền: " + bankInfo);
        transactionRepository.save(tx);
    }

    @Transactional
    public void depositVNPay(Long userId, long amountVnd, String txnRef) {
        Wallet wallet = getMyWallet(userId);
        BigDecimal amount = BigDecimal.valueOf(amountVnd);
        wallet.setBalance(wallet.getBalance().add(amount));
        walletRepository.save(wallet);
        Transaction tx = new Transaction(wallet, amount, TransactionType.DEPOSIT, "Nạp tiền qua VNPay - Mã GD: " + txnRef);
        transactionRepository.save(tx);
    }

    public List<WalletAdminDTO> getAllWallets() {
        return walletRepository.findAll().stream().map(w -> {
            String loginName = w.getUser().getIdentityNumber() != null
                    ? w.getUser().getIdentityNumber()
                    : (w.getUser().getEmail() != null ? w.getUser().getEmail()
                    : (w.getUser().getPhoneNumber() != null ? w.getUser().getPhoneNumber() : ""));
            return new WalletAdminDTO(w.getId(), loginName, w.getUser().getFullName(), w.getStatus(), w.getBalance());
        }).collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public void toggleWalletStatus(Long walletId, String newStatus) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));
        wallet.setStatus(newStatus);
        walletRepository.save(wallet);
    }

    public List<Transaction> getTransactionsByWalletId(Long walletId) {
        return transactionRepository.findByWalletIdOrderByCreatedAtDesc(walletId);
    }
}

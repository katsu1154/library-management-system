package com.library.service;

import com.library.dto.DepositRequestDTO;
import com.library.dto.FinanceReportDTO;
import com.library.entity.*;
import com.library.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.ArrayList;
import java.util.Comparator;
import java.time.LocalDateTime;
import com.library.dto.FinanceTransactionItemDTO;

@Service
public class FinanceService {

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private ImportTicketRepository importTicketRepository;

    @Autowired
    private UserRepository userRepository;

    public User searchUserByPhone(String phone) {
        return userRepository.findByPhoneNumber(phone)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy độc giả với số điện thoại này"));
    }

    @Transactional
    public Transaction depositToWallet(Long accountantId, DepositRequestDTO request) {
        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Số tiền nạp phải lớn hơn 0");
        }

        User accountant = userRepository.findById(accountantId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kế toán!"));

        Wallet wallet = walletRepository.findByUserId(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Độc giả này chưa có ví điện tử!"));

        wallet.setBalance(wallet.getBalance().add(request.getAmount()));
        walletRepository.save(wallet);

        Transaction transaction = new Transaction();
        transaction.setWallet(wallet);
        transaction.setAmount(request.getAmount());
        transaction.setType(TransactionType.DEPOSIT);
        transaction.setDescription("Nạp tiền thủ công bởi kế toán " + accountant.getFullName() + ". Ghi chú: " + request.getNote());
        transaction.setCreatedAt(LocalDateTime.now());
        
        return transactionRepository.save(transaction);
    }

    public List<Transaction> getDepositHistory() {
        return transactionRepository.findByTypeOrderByCreatedAtDesc(TransactionType.DEPOSIT);
    }

    public List<Transaction> getPenaltyHistory() {
        return transactionRepository.findByTypeOrderByCreatedAtDesc(TransactionType.PENALTY);
    }

    public FinanceReportDTO getFinanceReport() {
        // 1. Tính tổng chi (Tổng ImportTicket đã APPROVED)
        List<ImportTicket> imports = importTicketRepository.findAll();
        List<FinanceTransactionItemDTO> dtoList = new ArrayList<>();
        BigDecimal totalExpense = BigDecimal.ZERO;

        for (ImportTicket t : imports) {
            if (t.getStatus() == ImportStatus.APPROVED) {
                totalExpense = totalExpense.add(t.getTotalCost());
                dtoList.add(new FinanceTransactionItemDTO(t.getImportDate(), "Nhập kho vé #" + t.getId(), "EXPENSE", t.getTotalCost()));
            }
        }

        List<Transaction> revenueTransactions = transactionRepository.findByTypeIn(
                Arrays.asList(TransactionType.WITHDRAWAL, TransactionType.PENALTY)
        );
        BigDecimal totalIncome = BigDecimal.ZERO;

        for (Transaction tx : revenueTransactions) {
            if (tx.getType() == TransactionType.PENALTY) {
                totalIncome = totalIncome.add(tx.getAmount());
                dtoList.add(new FinanceTransactionItemDTO(tx.getCreatedAt(), tx.getDescription(), "INCOME", tx.getAmount()));
            } else if (tx.getType() == TransactionType.WITHDRAWAL) {
                String desc = tx.getDescription() != null ? tx.getDescription().toLowerCase() : "";
                if (desc.contains("phí")) {
                    totalIncome = totalIncome.add(tx.getAmount());
                    dtoList.add(new FinanceTransactionItemDTO(tx.getCreatedAt(), tx.getDescription(), "INCOME", tx.getAmount()));
                }
            }
        }

        dtoList.sort(Comparator.comparing(FinanceTransactionItemDTO::getDate).reversed());

        BigDecimal profit = totalIncome.subtract(totalExpense);
        return new FinanceReportDTO(totalIncome, totalExpense, profit, dtoList);
    }
}

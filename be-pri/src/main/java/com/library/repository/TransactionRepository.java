package com.library.repository;

import com.library.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByWalletIdOrderByCreatedAtDesc(Long walletId);
    List<Transaction> findByWalletIdAndCreatedAtBetweenOrderByCreatedAtAsc(Long walletId, java.time.LocalDateTime from, java.time.LocalDateTime to);
    List<Transaction> findByWalletIdAndDescriptionContainingOrderByCreatedAtAsc(Long walletId, String keyword);
    List<Transaction> findByWalletIdAndBorrowTicketIdOrderByCreatedAtAsc(Long walletId, Long borrowTicketId);
    List<Transaction> findByTypeOrderByCreatedAtDesc(com.library.entity.TransactionType type);
    List<Transaction> findByTypeIn(java.util.Collection<com.library.entity.TransactionType> types);

    @Query("SELECT t FROM Transaction t WHERE t.wallet.id = :walletId AND (t.borrowTicketId = :ticketId OR t.description LIKE CONCAT('%', :borrowCode, '%')) ORDER BY t.createdAt ASC")
    List<Transaction> findByWalletAndBorrowTicketOrCode(@Param("walletId") Long walletId, @Param("ticketId") Long ticketId, @Param("borrowCode") String borrowCode);
}

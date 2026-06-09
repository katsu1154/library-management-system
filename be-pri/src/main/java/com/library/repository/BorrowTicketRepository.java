package com.library.repository;

import com.library.entity.BorrowStatus;
import com.library.entity.BorrowTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BorrowTicketRepository extends JpaRepository<BorrowTicket, Long> {
    Optional<BorrowTicket> findByBorrowCode(String borrowCode);
    List<BorrowTicket> findByUserId(Long userId);
    List<BorrowTicket> findByStatus(BorrowStatus status);
    long countByBorrowDateBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);
}

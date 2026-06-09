package com.library.repository;

import com.library.entity.Violation;
import com.library.entity.ViolationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ViolationRepository extends JpaRepository<Violation, Long> {
    List<Violation> findByUserId(Long userId);
    List<Violation> findByUserIdAndStatus(Long userId, ViolationStatus status);
    List<Violation> findByUserIdAndCreatedAtBetween(Long userId, java.time.LocalDateTime from, java.time.LocalDateTime to);
    List<Violation> findByUserIdAndDescriptionContaining(Long userId, String keyword);
    List<Violation> findByBorrowTicketId(Long borrowTicketId);
    long countByUserId(Long userId);
    long countByCreatedAtBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);
    long countByStatus(ViolationStatus status);

    @Query("SELECT DISTINCT v FROM Violation v WHERE v.borrowTicketId = :ticketId OR (v.user.id = :userId AND v.description LIKE CONCAT('%', :borrowCode, '%'))")
    List<Violation> findByBorrowTicketIdOrUserAndBorrowCode(@Param("ticketId") Long ticketId, @Param("userId") Long userId, @Param("borrowCode") String borrowCode);
}

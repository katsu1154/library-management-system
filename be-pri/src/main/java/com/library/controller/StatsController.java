package com.library.controller;

import com.library.entity.RoleType;
import com.library.entity.ViolationStatus;
import com.library.repository.BookRepository;
import com.library.repository.BookCopyRepository;
import com.library.repository.BorrowTicketRepository;
import com.library.repository.UserRepository;
import com.library.repository.ViolationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private BookCopyRepository bookCopyRepository;

    @Autowired
    private BorrowTicketRepository borrowTicketRepository;

    @Autowired
    private ViolationRepository violationRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats() {
        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime endOfMonth = LocalDate.now().plusMonths(1).withDayOfMonth(1).atStartOfDay().minusSeconds(1);

        long totalReaders = userRepository.countByRoleIn(List.of(RoleType.ROLE_EXTERNAL_READER, RoleType.ROLE_INTERNAL_READER));
        long totalBooks = bookRepository.count();
        long totalCopies = bookCopyRepository.count();
        long borrowsThisMonth = borrowTicketRepository.countByBorrowDateBetween(startOfMonth, endOfMonth);
        long violationsThisMonth = violationRepository.countByCreatedAtBetween(startOfMonth, endOfMonth);
        long pendingViolations = violationRepository.countByStatus(ViolationStatus.UNPAID);

        return ResponseEntity.ok(Map.of(
            "totalReaders", totalReaders,
            "totalBooks", totalBooks,
            "totalCopies", totalCopies,
            "borrowsThisMonth", borrowsThisMonth,
            "violations", violationsThisMonth,
            "pendingViolations", pendingViolations,
            "onTimeReturns", 0, // Dữ liệu giả định tạm thời
            "lateReturns", 0,
            "onTimePercent", 100
        ));
    }
}

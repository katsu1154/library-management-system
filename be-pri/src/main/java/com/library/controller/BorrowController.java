package com.library.controller;

import com.library.dto.BorrowRequest;
import com.library.dto.MessageResponse;
import com.library.dto.RenewRequest;
import com.library.dto.ReturnRequest;
import com.library.security.CustomUserDetails;
import com.library.service.BorrowService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/borrow")
public class BorrowController {

    @Autowired
    private BorrowService borrowService;


    @GetMapping("/my-tickets")
    @PreAuthorize("hasAnyRole('INTERNAL_READER', 'EXTERNAL_READER')")
    public ResponseEntity<?> getMyTickets(Authentication auth) {
        CustomUserDetails user = (CustomUserDetails) auth.getPrincipal();
        return ResponseEntity.ok(borrowService.getMyTickets(user.getId()));
    }

    @PostMapping("/reserve")
    @PreAuthorize("hasAnyRole('INTERNAL_READER', 'EXTERNAL_READER')")
    public ResponseEntity<?> reserveBook(@Valid @RequestBody BorrowRequest req, Authentication auth) {
        try {
            CustomUserDetails user = (CustomUserDetails) auth.getPrincipal();
            return ResponseEntity.ok(borrowService.reserveBook(req, user.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/{ticketId}/cancel")
    @PreAuthorize("hasAnyRole('INTERNAL_READER', 'EXTERNAL_READER')")
    public ResponseEntity<?> cancelReservation(@PathVariable Long ticketId, Authentication auth) {
        try {
            CustomUserDetails user = (CustomUserDetails) auth.getPrincipal();
            return ResponseEntity.ok(borrowService.cancelReservation(ticketId, user.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/{ticketId}/renew")
    @PreAuthorize("hasAnyRole('INTERNAL_READER', 'EXTERNAL_READER')")
    public ResponseEntity<?> renewBook(@PathVariable Long ticketId, @Valid @RequestBody RenewRequest req, Authentication auth) {
        try {
            CustomUserDetails user = (CustomUserDetails) auth.getPrincipal();
            return ResponseEntity.ok(borrowService.renewBook(ticketId, req, user.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // ---- Thủ thư & Admin ----

    @GetMapping("/{ticketId}/detail")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN','WAREHOUSE_MANAGER','ACCOUNTANT')")
    public ResponseEntity<?> getTicketDetail(@PathVariable Long ticketId) {
        try {
            return ResponseEntity.ok(borrowService.getTicketDetail(ticketId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN','WAREHOUSE_MANAGER','ACCOUNTANT')")
    public ResponseEntity<?> getAllTickets() {
        return ResponseEntity.ok(borrowService.getAll());
    }

    @PostMapping("/pickup/{borrowCode}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN','WAREHOUSE_MANAGER','ACCOUNTANT')")
    public ResponseEntity<?> pickupBook(@PathVariable String borrowCode) {
        try {
            return ResponseEntity.ok(borrowService.pickupBook(borrowCode));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/return/{borrowCode}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN','ACCOUNTANT')")
    public ResponseEntity<?> returnBook(@PathVariable String borrowCode, @Valid @RequestBody ReturnRequest req) {
        try {
            return ResponseEntity.ok(borrowService.returnBook(borrowCode, req));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/remind/{borrowCode}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<?> remindOverdue(@PathVariable String borrowCode) {
        try {
            borrowService.remindOverdueTicket(borrowCode);
            return ResponseEntity.ok(new MessageResponse("Đã gửi email nhắc nhở trả sách thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}

package com.library.controller;

import com.library.dto.MessageResponse;
import com.library.dto.ViolationRequest;
import com.library.security.CustomUserDetails;
import com.library.service.ViolationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/violations")
public class ViolationController {

    @Autowired
    private ViolationService violationService;


    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN','ACCOUNTANT')")
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(violationService.getAllViolations());
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN','ACCOUNTANT')")
    public ResponseEntity<?> getByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(violationService.getViolationsByUserId(userId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN','ACCOUNTANT')")
    public ResponseEntity<?> create(@Valid @RequestBody ViolationRequest request) {
        try {
            return ResponseEntity.ok(violationService.createViolation(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/{id}/remind")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN','ACCOUNTANT')")
    public ResponseEntity<?> remind(@PathVariable Long id) {
        try {
            violationService.remindViolation(id);
            return ResponseEntity.ok(new MessageResponse("Đã gửi nhắc nhở thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN','ACCOUNTANT')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            violationService.deleteViolation(id);
            return ResponseEntity.ok(new MessageResponse("Deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }


    @GetMapping("/my-history")
    @PreAuthorize("hasAnyRole('INTERNAL_READER', 'EXTERNAL_READER')")
    public ResponseEntity<?> getMyHistory(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(violationService.getViolationsByUserId(userDetails.getId()));
    }

    @GetMapping("/my-unpaid")
    @PreAuthorize("hasAnyRole('INTERNAL_READER', 'EXTERNAL_READER')")
    public ResponseEntity<?> getMyUnpaid(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(violationService.getUnpaidViolationsByUserId(userDetails.getId()));
    }

    @PostMapping("/{id}/pay")
    @PreAuthorize("hasAnyRole('INTERNAL_READER', 'EXTERNAL_READER')")
    public ResponseEntity<?> payViolation(@PathVariable Long id, Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            return ResponseEntity.ok(violationService.payViolation(id, userDetails.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}

package com.library.controller;

import com.library.dto.DepositRequestDTO;
import com.library.dto.MessageResponse;
import com.library.security.CustomUserDetails;
import com.library.service.FinanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/finance")
@PreAuthorize("hasAnyRole('ACCOUNTANT', 'ADMIN')")
public class FinanceController {

    @Autowired
    private FinanceService financeService;

    @GetMapping("/search-user")
    public ResponseEntity<?> searchUserByPhone(@RequestParam String phone) {
        try {
            return ResponseEntity.ok(financeService.searchUserByPhone(phone));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/deposit")
    public ResponseEntity<?> depositToWallet(@RequestBody DepositRequestDTO request, Authentication auth) {
        try {
            CustomUserDetails user = (CustomUserDetails) auth.getPrincipal();
            com.library.entity.Transaction tx = financeService.depositToWallet(user.getId(), request);
            
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("id", tx.getId());
            response.put("amount", tx.getAmount());
            response.put("type", tx.getType().name());
            response.put("description", tx.getDescription());
            response.put("createdAt", tx.getCreatedAt());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/deposits")
    public ResponseEntity<?> getDepositHistory() {
        return ResponseEntity.ok(financeService.getDepositHistory());
    }

    @GetMapping("/penalties")
    public ResponseEntity<?> getPenaltyHistory() {
        return ResponseEntity.ok(financeService.getPenaltyHistory());
    }

    @GetMapping("/report")
    public ResponseEntity<?> getFinanceReport() {
        return ResponseEntity.ok(financeService.getFinanceReport());
    }
}

package com.library.controller;

import com.library.dto.MessageResponse;
import com.library.service.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/wallets")
@PreAuthorize("hasRole('ADMIN')")
public class AdminWalletController {

    @Autowired
    private WalletService walletService;

    @GetMapping
    public ResponseEntity<?> getAllWallets() {
        try {
            return ResponseEntity.ok(walletService.getAllWallets());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/{walletId}/transactions")
    public ResponseEntity<?> getTransactionsByWalletId(@PathVariable Long walletId) {
        try {
            return ResponseEntity.ok(walletService.getTransactionsByWalletId(walletId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/{walletId}/status")
    public ResponseEntity<?> toggleStatus(@PathVariable Long walletId, @RequestBody java.util.Map<String, String> payload) {
        try {
            walletService.toggleWalletStatus(walletId, payload.get("status"));
            return ResponseEntity.ok(new MessageResponse("Status updated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}

package com.library.controller;

import com.library.dto.MessageResponse;
import com.library.dto.WithdrawRequestDto;
import com.library.security.CustomUserDetails;
import com.library.service.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wallets/me")
@PreAuthorize("hasAnyRole('EXTERNAL_READER', 'INTERNAL_READER')")
public class WalletController {

    @Autowired
    private WalletService walletService;

    @GetMapping
    public ResponseEntity<?> getMyWallet(@AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            return ResponseEntity.ok(walletService.getMyWallet(userDetails.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/transactions")
    public ResponseEntity<?> getMyTransactions(@AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            return ResponseEntity.ok(walletService.getMyTransactions(userDetails.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/withdraw")
    public ResponseEntity<?> requestWithdrawal(@AuthenticationPrincipal CustomUserDetails userDetails, @RequestBody WithdrawRequestDto request) {
        try {
            walletService.withdraw(userDetails.getId(), request.getAmount(), request.getDescription());
            return ResponseEntity.ok(new MessageResponse("Rút tiền thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}

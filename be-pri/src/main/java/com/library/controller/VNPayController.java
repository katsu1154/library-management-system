package com.library.controller;

import com.library.dto.MessageResponse;
import com.library.security.CustomUserDetails;
import com.library.service.VNPayService;
import com.library.service.WalletService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/vnpay")
public class VNPayController {

    @Autowired
    private VNPayService vnPayService;

    @Autowired
    private WalletService walletService;

    @Value("${vnpay.frontendUrl:http://localhost:3000}")
    private String frontendUrl;

    @PostMapping("/create-payment")
    @PreAuthorize("hasAnyRole('EXTERNAL_READER', 'INTERNAL_READER')")
    public ResponseEntity<?> createPayment(
            @RequestParam long amount,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest request) {
        try {
            if (amount < 10000) {
                return ResponseEntity.badRequest().body(new MessageResponse("Số tiền tối thiểu là 10.000đ"));
            }
            String ipAddr = getClientIp(request);
            String paymentUrl = vnPayService.createPaymentUrl(userDetails.getId(), amount, ipAddr);
            return ResponseEntity.ok(Map.of("paymentUrl", paymentUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/return")
    public RedirectView handleReturn(@RequestParam Map<String, String> params) {
        boolean isValid = vnPayService.verifyReturn(new HashMap<>(params));
        String responseCode = params.get("vnp_ResponseCode");

        if (isValid && "00".equals(responseCode)) {
            String txnRef = params.get("vnp_TxnRef");
            long amountRaw = Long.parseLong(params.getOrDefault("vnp_Amount", "0"));
            long amountVnd = amountRaw / 100;

            Long userId = vnPayService.parseUserIdFromTxnRef(txnRef);
            if (userId != null && amountVnd > 0) {
                try {
                    walletService.depositVNPay(userId, amountVnd, txnRef);
                    return new RedirectView(frontendUrl + "/services/wallet?payment=success&amount=" + amountVnd);
                } catch (Exception e) {
                    return new RedirectView(frontendUrl + "/services/wallet?payment=error");
                }
            }
        }

        return new RedirectView(frontendUrl + "/services/wallet?payment=failed");
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip != null ? ip : "127.0.0.1";
    }
}

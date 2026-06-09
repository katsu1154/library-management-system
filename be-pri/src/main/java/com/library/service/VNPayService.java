package com.library.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.TreeMap;

@Service
public class VNPayService {

    @Value("${vnpay.tmnCode}")
    private String tmnCode;

    @Value("${vnpay.hashSecret}")
    private String hashSecret;

    @Value("${vnpay.paymentUrl}")
    private String paymentUrl;

    @Value("${vnpay.returnUrl}")
    private String returnUrl;

    public String createPaymentUrl(Long userId, long amountVnd, String ipAddr) {
        String txnRef = userId + "_" + System.currentTimeMillis();
        String createDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String expireDate = LocalDateTime.now().plusMinutes(15).format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));

        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", tmnCode);
        params.put("vnp_Amount", String.valueOf(amountVnd * 100));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_OrderInfo", "Nap tien vi TLU userId " + userId);
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", returnUrl);
        params.put("vnp_IpAddr", ipAddr);
        params.put("vnp_CreateDate", createDate);
        params.put("vnp_ExpireDate", expireDate);

        StringBuilder queryBuilder = new StringBuilder();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (queryBuilder.length() > 0) queryBuilder.append("&");
            queryBuilder.append(URLEncoder.encode(entry.getKey(), StandardCharsets.US_ASCII));
            queryBuilder.append("=");
            queryBuilder.append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII));
        }

        String queryString = queryBuilder.toString();
        String secureHash = hmacSHA512(hashSecret, queryString);
        return paymentUrl + "?" + queryString + "&vnp_SecureHash=" + secureHash;
    }

    public boolean verifyReturn(Map<String, String> params) {
        String vnpSecureHash = params.get("vnp_SecureHash");
        if (vnpSecureHash == null) return false;

        Map<String, String> sortedParams = new TreeMap<>();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            String key = entry.getKey();
            if (!key.equals("vnp_SecureHash") && !key.equals("vnp_SecureHashType")) {
                sortedParams.put(key, entry.getValue());
            }
        }

        StringBuilder queryBuilder = new StringBuilder();
        for (Map.Entry<String, String> entry : sortedParams.entrySet()) {
            if (entry.getValue() != null && !entry.getValue().isEmpty()) {
                if (queryBuilder.length() > 0) queryBuilder.append("&");
                queryBuilder.append(URLEncoder.encode(entry.getKey(), StandardCharsets.US_ASCII));
                queryBuilder.append("=");
                queryBuilder.append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII));
            }
        }

        String computedHash = hmacSHA512(hashSecret, queryBuilder.toString());
        return computedHash.equalsIgnoreCase(vnpSecureHash);
    }

    public Long parseUserIdFromTxnRef(String txnRef) {
        try {
            return Long.parseLong(txnRef.split("_")[0]);
        } catch (Exception e) {
            return null;
        }
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            mac.init(secretKey);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("HMAC SHA512 error", e);
        }
    }
}

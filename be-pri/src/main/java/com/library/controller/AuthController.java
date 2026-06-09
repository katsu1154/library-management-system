package com.library.controller;

import com.library.dto.JwtResponse;
import com.library.dto.LoginRequest;
import com.library.dto.MessageResponse;
import com.library.dto.RegisterRequest;
import com.library.dto.VerifyOtpRequest;
import com.library.dto.SocialLoginRequest;
import com.library.entity.User;
import com.library.security.CustomUserDetails;
import com.library.security.JwtUtils;
import com.library.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getEmail(),
                userDetails.getFullName(),
                userDetails.getAvatarUrl(),
                userDetails.getAuthorities().iterator().next().getAuthority()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        try {
            authService.registerUser(signUpRequest);
            return ResponseEntity.ok(new MessageResponse("User registered successfully. Please check your email for the OTP!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/verify-account")
    public ResponseEntity<?> verifyAccount(@Valid @RequestBody VerifyOtpRequest verifyRequest) {
        try {
            authService.verifyAccount(verifyRequest.getEmail(), verifyRequest.getOtpCode());
            return ResponseEntity.ok(new MessageResponse("Account verified successfully!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam("email") String email) {
        try {
            authService.generatePasswordResetToken(email);
            return ResponseEntity.ok(new MessageResponse("Password reset OTP sent to your email"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String otpCode = request.get("otpCode");
            String newPassword = request.get("newPassword");
            authService.resetPassword(email, otpCode, newPassword);
            return ResponseEntity.ok(new MessageResponse("Password has been reset successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/social-login")
    public ResponseEntity<?> socialLogin(@Valid @RequestBody SocialLoginRequest request) {
        try {
            User user = authService.processSocialLogin(request.getProvider(), request.getToken());

            // Fake authentication context since it's already verified via Google/Microsoft
            CustomUserDetails userDetails = CustomUserDetails.build(user);
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            return ResponseEntity.ok(new JwtResponse(jwt,
                    userDetails.getId(),
                    userDetails.getEmail(),
                    userDetails.getFullName(),
                    userDetails.getAvatarUrl(),
                    userDetails.getAuthorities().iterator().next().getAuthority()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}

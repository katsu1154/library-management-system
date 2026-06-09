package com.library.controller;

import com.library.dto.MessageResponse;
import com.library.security.CustomUserDetails;
import com.library.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.library.dto.ChangePasswordRequestDTO;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users/me")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @GetMapping
    public ResponseEntity<?> getMyProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            return ResponseEntity.ok(profileService.getMyProfile(userDetails.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping
    public ResponseEntity<?> updateMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) String fullName,
            @RequestParam(required = false) String phoneNumber,
            @RequestParam(required = false) String identityNumber,
            @RequestParam(required = false) MultipartFile avatar) {
        try {
            return ResponseEntity.ok(profileService.updateMyProfile(userDetails.getId(), fullName, phoneNumber, identityNumber, avatar));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequestDTO request, @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            profileService.changePassword(userDetails.getId(), request.getOldPassword(), request.getNewPassword());
            return ResponseEntity.ok(new MessageResponse("Đổi mật khẩu thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}

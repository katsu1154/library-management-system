package com.library.controller;

import com.library.dto.AdminCreateUserRequest;
import com.library.dto.AdminUpdateUserRequest;
import com.library.dto.MessageResponse;
import com.library.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import com.library.security.CustomUserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    @Autowired
    private AuthService authService;

    @Autowired
    private com.library.repository.UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createUser(@Valid @RequestBody AdminCreateUserRequest request) {
        try {
            authService.createUserByAdmin(request);
            return ResponseEntity.ok(new MessageResponse("User created successfully with role " + request.getRole()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long id, 
            @ModelAttribute AdminUpdateUserRequest request,
            @RequestParam(required = false) MultipartFile avatar,
            Authentication auth) {
        try {
            CustomUserDetails currentUser = (CustomUserDetails) auth.getPrincipal();
            if (currentUser.getId().equals(id) && request.getRole() != null) {
                return ResponseEntity.badRequest().body(new MessageResponse("Admin không được tự thay đổi Role của chính mình!"));
            }
            authService.updateUserByAdmin(id, request, avatar);
            return ResponseEntity.ok(new MessageResponse("User updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PatchMapping("/{id}/ban")
    public ResponseEntity<?> banUser(@PathVariable Long id, @RequestParam boolean ban, Authentication auth) {
        try {
            CustomUserDetails currentUser = (CustomUserDetails) auth.getPrincipal();
            if (currentUser.getId().equals(id)) {
                return ResponseEntity.badRequest().body(new MessageResponse("Admin không được tự Ban chính mình!"));
            }
            authService.toggleUserBanStatus(id, ban);
            String action = ban ? "banned" : "unbanned";
            return ResponseEntity.ok(new MessageResponse("User " + action + " successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}

package com.library.controller;

import com.library.dto.FeedbackRequestDTO;
import com.library.dto.FeedbackResponseDTO;
import com.library.dto.MessageResponse;
import com.library.security.CustomUserDetails;
import com.library.service.SupportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/feedbacks")
public class FeedbackController {

    @Autowired
    private SupportService supportService;

    @PostMapping
    public ResponseEntity<?> createFeedback(
            @RequestParam("type") String type,
            @RequestParam("content") String content,
            @RequestParam(value = "attachment", required = false) org.springframework.web.multipart.MultipartFile attachment,
            Authentication auth) {
        try {
            CustomUserDetails user = (CustomUserDetails) auth.getPrincipal();
            return ResponseEntity.ok(supportService.createFeedback(user.getId(), type, content, attachment));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyFeedbacks(Authentication auth) {
        CustomUserDetails user = (CustomUserDetails) auth.getPrincipal();
        return ResponseEntity.ok(supportService.getMyFeedbacks(user.getId()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<?> getAllFeedbacks() {
        return ResponseEntity.ok(supportService.getAllFeedbacks());
    }

    @PutMapping("/{id}/respond")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<?> respondFeedback(@PathVariable Long id, @RequestBody FeedbackResponseDTO request, Authentication auth) {
        try {
            CustomUserDetails user = (CustomUserDetails) auth.getPrincipal();
            return ResponseEntity.ok(supportService.respondFeedback(id, user.getId(), request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}

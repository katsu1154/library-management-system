package com.library.controller;

import com.library.dto.MessageResponse;
import com.library.dto.NotificationRequestDTO;
import com.library.security.CustomUserDetails;
import com.library.service.SupportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private SupportService supportService;

    @PostMapping("/send")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<?> sendNotification(@RequestBody NotificationRequestDTO request) {
        try {
            supportService.sendNotification(request);
            return ResponseEntity.ok(new MessageResponse("Gửi thông báo thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyNotifications(Authentication auth) {
        CustomUserDetails user = (CustomUserDetails) auth.getPrincipal();
        return ResponseEntity.ok(supportService.getMyNotifications(user.getId()));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id, Authentication auth) {
        try {
            CustomUserDetails user = (CustomUserDetails) auth.getPrincipal();
            supportService.markNotificationAsRead(id, user.getId());
            return ResponseEntity.ok(new MessageResponse("Đã đánh dấu đọc!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Integer> getUnreadCount(Authentication auth) {
        try {
            CustomUserDetails user = (CustomUserDetails) auth.getPrincipal();
            return ResponseEntity.ok(supportService.getUnreadNotificationCount(user.getId()));
        } catch (Exception e) {
            return ResponseEntity.ok(0);
        }
    }
}

package com.library.controller;

import com.library.dto.ChatMessageDTO;
import com.library.dto.MessageResponse;
import com.library.security.CustomUserDetails;
import com.library.service.SupportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private SupportService supportService;

    @PostMapping("/start")
    public ResponseEntity<?> startChatSession(Authentication auth) {
        try {
            CustomUserDetails user = (CustomUserDetails) auth.getPrincipal();
            return ResponseEntity.ok(supportService.startChatSession(user.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/sessions")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<?> getOpenSessions() {
        return ResponseEntity.ok(supportService.getOpenSessions());
    }

    @GetMapping("/my-sessions")
    public ResponseEntity<?> getMySessions(Authentication auth) {
        CustomUserDetails user = (CustomUserDetails) auth.getPrincipal();
        return ResponseEntity.ok(supportService.getMySessions(user.getId()));
    }

    @PostMapping("/sessions/{id}/join")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<?> joinSession(@PathVariable Long id, Authentication auth) {
        try {
            CustomUserDetails user = (CustomUserDetails) auth.getPrincipal();
            return ResponseEntity.ok(supportService.joinChatSession(id, user.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/sessions/{id}/close")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<?> closeSession(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(supportService.closeChatSession(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/sessions/{id}/messages")
    public ResponseEntity<?> getChatHistory(@PathVariable Long id) {
        return ResponseEntity.ok(supportService.getChatHistory(id));
    }

    @PostMapping("/sessions/{id}/messages")
    public ResponseEntity<?> sendMessage(@PathVariable Long id, @RequestBody ChatMessageDTO dto, Authentication auth) {
        try {
            CustomUserDetails user = (CustomUserDetails) auth.getPrincipal();
            dto.setSenderId(user.getId());
            return ResponseEntity.ok(supportService.saveAndBroadcastMessage(id, dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}

package com.library.service;

import com.library.dto.*;
import com.library.entity.*;
import com.library.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SupportService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ChatSessionRepository chatSessionRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private CloudinaryService cloudinaryService;

    // --- NOTIFICATIONS ---

    @Transactional
    public void sendNotification(NotificationRequestDTO req) {
        List<User> targets;
        String type = req.getTargetType() != null ? req.getTargetType().toUpperCase() : "";

        if ("ALL".equals(type)) {
            targets = userRepository.findAll();
        } else if ("INTERNAL".equals(type)) {
            targets = userRepository.findByRole(RoleType.ROLE_INTERNAL_READER);
        } else if ("EXTERNAL".equals(type)) {
            targets = userRepository.findByRole(RoleType.ROLE_EXTERNAL_READER);
        } else if ("STAFF".equals(type)) {
            targets = userRepository.findByRoleIn(List.of(RoleType.ROLE_ADMIN, RoleType.ROLE_LIBRARIAN, RoleType.ROLE_ACCOUNTANT));
        } else if ("ROLE".equals(type)) {
            RoleType targetRole = RoleType.valueOf(req.getTargetId());
            targets = userRepository.findByRole(targetRole);
        } else if ("USER".equals(type)) {
            Long userId = Long.parseLong(req.getTargetId());
            targets = List.of(userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found")));
        } else {
            throw new RuntimeException("Loại đối tượng không hợp lệ");
        }

        for (User u : targets) {
            Notification n = new Notification();
            n.setUser(u);
            n.setTitle(req.getTitle());
            n.setMessage(req.getMessage() != null ? req.getMessage() : req.getContent()); // Fallback to content if message is null
            notificationRepository.save(n);
        }
    }

    public List<Notification> getMyNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public int getUnreadNotificationCount(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalse(userId).size();
    }

    @Transactional
    public void markNotificationAsRead(Long id, Long userId) {
        Notification n = notificationRepository.findById(id).orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!n.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized");
        }
        n.setRead(true);
        notificationRepository.save(n);
    }

    // --- FEEDBACKS ---

    @Transactional
    public Feedback createFeedback(Long userId, String type, String content, org.springframework.web.multipart.MultipartFile file) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Feedback f = new Feedback();
        f.setUser(user);
        f.setType(type);
        f.setContent(content);
        
        if (file != null && !file.isEmpty()) {
            try {
                String url = cloudinaryService.uploadImage(file);
                f.setAttachmentUrl(url);
            } catch (java.io.IOException e) {
                throw new RuntimeException("Lỗi upload ảnh: " + e.getMessage());
            }
        }
        
        return feedbackRepository.save(f);
    }

    @Transactional
    public Feedback respondFeedback(Long feedbackId, Long responderId, FeedbackResponseDTO req) {
        Feedback f = feedbackRepository.findById(feedbackId).orElseThrow(() -> new RuntimeException("Feedback not found"));
        User responder = userRepository.findById(responderId).orElseThrow(() -> new RuntimeException("Responder not found"));
        
        f.setResponse(req.getResponse());
        f.setResponder(responder);
        if (req.getStatus() != null) {
            try {
                f.setStatus(FeedbackStatus.valueOf(req.getStatus().toUpperCase()));
            } catch (Exception e) {
                f.setStatus(FeedbackStatus.RESOLVED);
            }
        } else {
            f.setStatus(FeedbackStatus.RESOLVED);
        }
        f.setRespondedAt(LocalDateTime.now());
        
        // Gửi thông báo cho Độc giả
        Notification n = new Notification();
        n.setUser(f.getUser());
        n.setTitle("Phản hồi: " + f.getType());
        n.setMessage("Thư viện đã phản hồi ý kiến của bạn. Vui lòng kiểm tra mục Hỗ trợ.");
        notificationRepository.save(n);

        return feedbackRepository.save(f);
    }

    public List<Feedback> getMyFeedbacks(Long userId) {
        return feedbackRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Feedback> getAllFeedbacks() {
        return feedbackRepository.findAll();
    }

    // --- CHAT ---

    @Transactional
    public ChatSession startChatSession(Long readerId) {
        User reader = userRepository.findById(readerId).orElseThrow(() -> new RuntimeException("User not found"));
        return chatSessionRepository.findByReaderIdOrderByCreatedAtDesc(readerId)
                .stream()
                .filter(s -> s.getStatus() == ChatStatus.OPEN)
                .findFirst()
                .orElseGet(() -> {
                    ChatSession session = new ChatSession();
                    session.setReader(reader);
                    return chatSessionRepository.save(session);
                });
    }

    public List<ChatSession> getOpenSessions() {
        return chatSessionRepository.findByStatusOrderByCreatedAtDesc(ChatStatus.OPEN);
    }

    public List<ChatSession> getMySessions(Long readerId) {
        return chatSessionRepository.findByReaderIdOrderByCreatedAtDesc(readerId);
    }

    @Transactional
    public ChatSession joinChatSession(Long sessionId, Long librarianId) {
        ChatSession session = chatSessionRepository.findById(sessionId).orElseThrow(() -> new RuntimeException("Session not found"));
        User librarian = userRepository.findById(librarianId).orElseThrow(() -> new RuntimeException("Librarian not found"));
        session.setLibrarian(librarian);
        return chatSessionRepository.save(session);
    }

    @Transactional
    public ChatSession closeChatSession(Long sessionId) {
        ChatSession session = chatSessionRepository.findById(sessionId).orElseThrow(() -> new RuntimeException("Session not found"));
        session.setStatus(ChatStatus.CLOSED);
        return chatSessionRepository.save(session);
    }

    @Transactional
    public ChatMessage saveAndBroadcastMessage(Long sessionId, ChatMessageDTO dto) {
        ChatSession session = chatSessionRepository.findById(sessionId).orElseThrow(() -> new RuntimeException("Session not found"));
        if (session.getStatus() == ChatStatus.CLOSED) {
            throw new RuntimeException("Phiên chat đã kết thúc!");
        }

        User sender = userRepository.findById(dto.getSenderId()).orElseThrow(() -> new RuntimeException("Sender not found"));

        // Nếu người gửi là nhân viên, tự động gán làm librarian của session
        boolean isStaff = sender.getRole() == RoleType.ROLE_LIBRARIAN
                || sender.getRole() == RoleType.ROLE_ADMIN
                || sender.getRole() == RoleType.ROLE_ACCOUNTANT;
        if (isStaff && session.getLibrarian() == null) {
            session.setLibrarian(sender);
            chatSessionRepository.save(session);
        }

        ChatMessage msg = new ChatMessage();
        msg.setChatSession(session);
        msg.setSender(sender);
        msg.setContent(dto.getContent());
        msg = chatMessageRepository.save(msg);

        // Broadcast qua WebSocket
        messagingTemplate.convertAndSend("/topic/chat/" + sessionId, msg);

        // Chỉ gọi Gemini khi chưa có nhân viên nào tham gia và người gửi là độc giả
        if (!isStaff && session.getLibrarian() == null) {
            geminiService.handleAiChatAsync(sessionId, dto.getContent());
        }

        return msg;
    }

    public List<ChatMessage> getChatHistory(Long sessionId) {
        return chatMessageRepository.findByChatSessionIdOrderBySentAtAsc(sessionId);
    }
}

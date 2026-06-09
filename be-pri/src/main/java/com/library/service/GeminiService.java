package com.library.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.library.entity.ChatMessage;
import com.library.entity.ChatSession;
import com.library.repository.ChatMessageRepository;
import com.library.repository.ChatSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    @Autowired
    private ChatSessionRepository chatSessionRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private final RestTemplate restTemplate = new RestTemplate();

    public String getAiResponse(String userMessage) {
        try {
            String fullUrl = apiUrl + apiKey;
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String prompt = "Bạn là Trợ lý thư viện thông minh của Hệ thống Quản lý Thư viện. " +
                            "Hãy trả lời ngắn gọn, lịch sự và giúp đỡ độc giả các vấn đề liên quan đến mượn/trả sách, vi phạm, hoặc hướng dẫn sử dụng thư viện. " +
                            "Câu hỏi của độc giả: " + userMessage;

            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", prompt);

            Map<String, Object> partMap = new HashMap<>();
            partMap.put("parts", Collections.singletonList(textPart));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", Collections.singletonList(partMap));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(fullUrl, entity, Map.class);
            
            if (response.getBody() != null && response.getBody().containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    Map<String, Object> content = (Map<String, Object>) candidate.get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    if (!parts.isEmpty()) {
                        return (String) parts.get(0).get("text");
                    }
                }
            }
            return "Xin lỗi, hiện tại tôi đang gặp khó khăn trong việc phản hồi. Bạn vui lòng đợi nhân viên trực nhé!";
        } catch (Exception e) {
            e.printStackTrace();
            return "Xin lỗi, Trợ lý thư viện hiện đang bận. Bạn vui lòng chờ nhân viên trực hỗ trợ nhé!";
        }
    }

    @Async
    public void handleAiChatAsync(Long sessionId, String userMessage) {
        try {
            // Giả lập chút delay để AI có vẻ "đang gõ"
            Thread.sleep(1500);
            
            String aiResponse = getAiResponse(userMessage);

            ChatSession session = chatSessionRepository.findById(sessionId).orElse(null);
            if (session == null) return;
            
            ChatMessage aiMsg = new ChatMessage();
            aiMsg.setChatSession(session);
            aiMsg.setSender(null); 
            aiMsg.setAiMessage(true);
            aiMsg.setContent(aiResponse);
            
            aiMsg = chatMessageRepository.save(aiMsg);

            // Broadcast qua WebSocket
            messagingTemplate.convertAndSend("/topic/chat/" + sessionId, aiMsg);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

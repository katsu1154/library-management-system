package com.library.dto;

public class ChatMessageDTO {
    private Long senderId;
    private String content;

    public ChatMessageDTO() {}

    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}

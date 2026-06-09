package com.library.dto;

public class NotificationRequestDTO {
    private String targetType; // "ROLE" or "USER"
    private String targetId;   // "ROLE_EXTERNAL_READER" or "1" (UserId)
    private String title;
    private String message;
    private String content;

    public NotificationRequestDTO() {}

    public String getTargetType() { return targetType; }
    public void setTargetType(String targetType) { this.targetType = targetType; }
    public String getTargetId() { return targetId; }
    public void setTargetId(String targetId) { this.targetId = targetId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}

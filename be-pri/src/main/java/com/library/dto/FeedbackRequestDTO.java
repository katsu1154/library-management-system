package com.library.dto;

public class FeedbackRequestDTO {
    private String subject;
    private String content;

    public FeedbackRequestDTO() {}

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}

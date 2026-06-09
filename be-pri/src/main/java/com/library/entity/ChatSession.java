package com.library.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_sessions")
public class ChatSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reader_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User reader;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "librarian_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User librarian;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChatStatus status = ChatStatus.OPEN;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public ChatSession() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getReader() { return reader; }
    public void setReader(User reader) { this.reader = reader; }
    public User getLibrarian() { return librarian; }
    public void setLibrarian(User librarian) { this.librarian = librarian; }
    public ChatStatus getStatus() { return status; }
    public void setStatus(ChatStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

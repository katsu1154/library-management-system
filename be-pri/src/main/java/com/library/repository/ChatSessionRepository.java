package com.library.repository;

import com.library.entity.ChatSession;
import com.library.entity.ChatStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    List<ChatSession> findByStatusOrderByCreatedAtDesc(ChatStatus status);
    List<ChatSession> findByReaderIdOrderByCreatedAtDesc(Long readerId);
}

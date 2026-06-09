package com.library.repository;

import com.library.entity.BookCopy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.library.entity.CopyStatus;

import java.util.List;

@Repository
public interface BookCopyRepository extends JpaRepository<BookCopy, Long> {
    boolean existsByCopyCode(String copyCode);
    List<BookCopy> findByBookId(Long bookId);
    java.util.Optional<BookCopy> findFirstByBookIdAndStatus(Long bookId, com.library.entity.CopyStatus status);
    long countByBookId(Long bookId);
    long countByBookIdAndStatusIn(Long bookId, java.util.Collection<com.library.entity.CopyStatus> statuses);
    long countByBookIdAndStatus(Long bookId, CopyStatus status);
}

package com.library.controller;

import com.library.dto.BookCopyRequest;
import com.library.dto.MessageResponse;
import com.library.entity.CopyStatus;
import com.library.service.BookCopyService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/book-copies")
@PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN','WAREHOUSE_MANAGER', 'ACCOUNTANT')")
public class BookCopyController {

    @Autowired
    private BookCopyService bookCopyService;

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(bookCopyService.getAll());
    }

    @GetMapping("/book/{bookId}")
    public ResponseEntity<?> getByBookId(@PathVariable Long bookId) {
        return ResponseEntity.ok(bookCopyService.getByBookId(bookId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(bookCopyService.getById(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody BookCopyRequest request) {
        try {
            return ResponseEntity.ok(bookCopyService.create(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam CopyStatus status) {
        try {
            return ResponseEntity.ok(bookCopyService.updateStatus(id, status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            bookCopyService.delete(id);
            return ResponseEntity.ok(new MessageResponse("Deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}

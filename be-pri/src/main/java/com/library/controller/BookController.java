package com.library.controller;

import com.library.dto.BookRequest;
import com.library.dto.MessageResponse;
import com.library.service.BookService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/books")
public class BookController {

    @Autowired
    private BookService bookService;

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(bookService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(bookService.getById(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchBooks(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long publisherId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long authorId) {
        return ResponseEntity.ok(bookService.searchBooks(keyword, publisherId, categoryId, authorId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<?> create(
            @ModelAttribute @Valid BookRequest request,
            @RequestParam(required = false) MultipartFile coverImage) {
        try {
            return ResponseEntity.ok(bookService.create(request, coverImage));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @ModelAttribute @Valid BookRequest request,
            @RequestParam(required = false) MultipartFile coverImage) {
        try {
            return ResponseEntity.ok(bookService.update(id, request, coverImage));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            bookService.delete(id);
            return ResponseEntity.ok(new MessageResponse("Deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}

package com.library.controller;

import com.library.dto.AuthorRequest;
import com.library.dto.MessageResponse;
import com.library.service.AuthorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/authors")
public class AuthorController {
    @Autowired
    private AuthorService authorService;

    @GetMapping
    public ResponseEntity<?> getAll() { return ResponseEntity.ok(authorService.getAll()); }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try { return ResponseEntity.ok(authorService.getById(id)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage())); }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<?> create(@Valid @RequestBody AuthorRequest request) {
        try { return ResponseEntity.ok(authorService.create(request)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage())); }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody AuthorRequest request) {
        try { return ResponseEntity.ok(authorService.update(id, request)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage())); }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try { authorService.delete(id); return ResponseEntity.ok(new MessageResponse("Deleted successfully")); }
        catch (Exception e) { return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage())); }
    }
}

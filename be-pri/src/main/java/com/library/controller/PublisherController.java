package com.library.controller;

import com.library.dto.PublisherRequest;
import com.library.dto.MessageResponse;
import com.library.service.PublisherService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/publishers")
public class PublisherController {
    @Autowired
    private PublisherService publisherService;

    @GetMapping
    public ResponseEntity<?> getAll() { return ResponseEntity.ok(publisherService.getAll()); }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try { return ResponseEntity.ok(publisherService.getById(id)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage())); }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<?> create(@Valid @RequestBody PublisherRequest request) {
        try { return ResponseEntity.ok(publisherService.create(request)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage())); }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody PublisherRequest request) {
        try { return ResponseEntity.ok(publisherService.update(id, request)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage())); }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try { publisherService.delete(id); return ResponseEntity.ok(new MessageResponse("Deleted successfully")); }
        catch (Exception e) { return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage())); }
    }
}

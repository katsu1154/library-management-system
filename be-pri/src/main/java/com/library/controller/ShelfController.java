package com.library.controller;

import com.library.dto.ShelfRequest;
import com.library.dto.MessageResponse;
import com.library.service.ShelfService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/shelves")
@PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
public class ShelfController {
    @Autowired
    private ShelfService shelfService;

    @GetMapping
    public ResponseEntity<?> getAll() { return ResponseEntity.ok(shelfService.getAll()); }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try { return ResponseEntity.ok(shelfService.getById(id)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage())); }
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody ShelfRequest request) {
        try { return ResponseEntity.ok(shelfService.create(request)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage())); }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody ShelfRequest request) {
        try { return ResponseEntity.ok(shelfService.update(id, request)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage())); }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try { shelfService.delete(id); return ResponseEntity.ok(new MessageResponse("Deleted successfully")); }
        catch (Exception e) { return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage())); }
    }
}

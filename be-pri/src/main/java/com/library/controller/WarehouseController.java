package com.library.controller;

import com.library.dto.ImportRequestDTO;
import com.library.dto.InventoryCheckRequestDTO;
import com.library.dto.MessageResponse;
import com.library.security.CustomUserDetails;
import com.library.service.WarehouseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/warehouse")
public class WarehouseController {

    @Autowired
    private WarehouseService warehouseService;

    @PostMapping("/import")
    @PreAuthorize("hasAnyRole('WAREHOUSE_MANAGER', 'ADMIN')")
    public ResponseEntity<?> createImportTicket(@RequestBody List<ImportRequestDTO> items, @RequestParam(required = false) String note, Authentication auth) {
        try {
            CustomUserDetails user = (CustomUserDetails) auth.getPrincipal();
            return ResponseEntity.ok(warehouseService.createImportTicket(user.getId(), items, note));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/import/{id}/approve")
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'ADMIN')")
    public ResponseEntity<?> approveImportTicket(@PathVariable Long id, @RequestBody com.library.dto.ApproveImportRequestDTO payload, Authentication auth) {
        try {
            CustomUserDetails user = (CustomUserDetails) auth.getPrincipal();
            return ResponseEntity.ok(warehouseService.approveImportTicket(user.getId(), id, payload.getActualCost(), payload.getInvoiceNumber()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/import/{id}/reject")
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'ADMIN')")
    public ResponseEntity<?> rejectImportTicket(@PathVariable Long id,
            @RequestBody(required = false) java.util.Map<String, String> body,
            Authentication auth) {
        try {
            CustomUserDetails user = (CustomUserDetails) auth.getPrincipal();
            String reason = body != null ? body.get("reason") : null;
            return ResponseEntity.ok(warehouseService.rejectImportTicket(user.getId(), id, reason));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/import")
    @PreAuthorize("hasAnyRole('WAREHOUSE_MANAGER', 'ACCOUNTANT', 'ADMIN')")
    public ResponseEntity<?> getImportHistory() {
        return ResponseEntity.ok(warehouseService.getImportHistory());
    }

    @PostMapping("/inventory-check")
    @PreAuthorize("hasAnyRole('WAREHOUSE_MANAGER', 'ADMIN')")
    public ResponseEntity<?> createInventoryCheck(@RequestBody List<InventoryCheckRequestDTO> items, @RequestParam(required = false) String note, Authentication auth) {
        try {
            CustomUserDetails user = (CustomUserDetails) auth.getPrincipal();
            return ResponseEntity.ok(warehouseService.createInventoryCheck(user.getId(), items, note));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/inventory-check")
    @PreAuthorize("hasAnyRole('WAREHOUSE_MANAGER', 'ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<?> getInventoryHistory() {
        return ResponseEntity.ok(warehouseService.getInventoryHistory());
    }

    @GetMapping("/report/low-stock")
    @PreAuthorize("hasAnyRole('WAREHOUSE_MANAGER', 'ADMIN')")
    public ResponseEntity<?> getLowStockReport() {
        return ResponseEntity.ok(warehouseService.getLowStockReport());
    }
}

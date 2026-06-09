package com.library.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "inventory_check_tickets")
public class InventoryCheckTicket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_manager_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User warehouseManager;

    @Column(nullable = false)
    private LocalDate checkDate;

    private String note;

    @OneToMany(mappedBy = "inventoryCheckTicket", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("inventoryCheckTicket")
    private List<InventoryCheckDetail> details = new ArrayList<>();

    public InventoryCheckTicket() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getWarehouseManager() { return warehouseManager; }
    public void setWarehouseManager(User warehouseManager) { this.warehouseManager = warehouseManager; }
    public LocalDate getCheckDate() { return checkDate; }
    public void setCheckDate(LocalDate checkDate) { this.checkDate = checkDate; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public List<InventoryCheckDetail> getDetails() { return details; }
    public void setDetails(List<InventoryCheckDetail> details) { this.details = details; }
}

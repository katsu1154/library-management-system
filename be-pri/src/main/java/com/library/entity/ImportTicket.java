package com.library.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "import_tickets")
public class ImportTicket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_manager_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User warehouseManager;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "accountant_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User accountant;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalCost = BigDecimal.ZERO;

    @Column(nullable = false)
    private LocalDateTime importDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ImportStatus status;

    private String note;

    @Column(length = 500)
    private String rejectReason;

    @Column(length = 100)
    private String invoiceNumber;

    @OneToMany(mappedBy = "importTicket", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("importTicket")
    private List<ImportTicketDetail> details = new ArrayList<>();

    public ImportTicket() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getWarehouseManager() { return warehouseManager; }
    public void setWarehouseManager(User warehouseManager) { this.warehouseManager = warehouseManager; }
    public User getAccountant() { return accountant; }
    public void setAccountant(User accountant) { this.accountant = accountant; }
    public BigDecimal getTotalCost() { return totalCost; }
    public void setTotalCost(BigDecimal totalCost) { this.totalCost = totalCost; }
    public LocalDateTime getImportDate() { return importDate; }
    public void setImportDate(LocalDateTime importDate) { this.importDate = importDate; }
    public ImportStatus getStatus() { return status; }
    public void setStatus(ImportStatus status) { this.status = status; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public String getRejectReason() { return rejectReason; }
    public void setRejectReason(String rejectReason) { this.rejectReason = rejectReason; }
    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }
    public List<ImportTicketDetail> getDetails() { return details; }
    public void setDetails(List<ImportTicketDetail> details) { this.details = details; }
}

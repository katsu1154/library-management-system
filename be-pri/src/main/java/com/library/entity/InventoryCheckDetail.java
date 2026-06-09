package com.library.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "inventory_check_details")
public class InventoryCheckDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_check_ticket_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "details"})
    private InventoryCheckTicket inventoryCheckTicket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Book book;

    @Column(nullable = false)
    private Integer systemQuantity;

    @Column(nullable = false)
    private Integer actualQuantity;

    @Column(nullable = false)
    private Integer difference;

    private String note;

    public InventoryCheckDetail() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public InventoryCheckTicket getInventoryCheckTicket() { return inventoryCheckTicket; }
    public void setInventoryCheckTicket(InventoryCheckTicket inventoryCheckTicket) { this.inventoryCheckTicket = inventoryCheckTicket; }
    public Book getBook() { return book; }
    public void setBook(Book book) { this.book = book; }
    public Integer getSystemQuantity() { return systemQuantity; }
    public void setSystemQuantity(Integer systemQuantity) { this.systemQuantity = systemQuantity; }
    public Integer getActualQuantity() { return actualQuantity; }
    public void setActualQuantity(Integer actualQuantity) { this.actualQuantity = actualQuantity; }
    public Integer getDifference() { return difference; }
    public void setDifference(Integer difference) { this.difference = difference; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}

package com.library.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "import_ticket_details")
public class ImportTicketDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "import_ticket_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "details"})
    private ImportTicket importTicket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Book book;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    public ImportTicketDetail() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ImportTicket getImportTicket() { return importTicket; }
    public void setImportTicket(ImportTicket importTicket) { this.importTicket = importTicket; }
    public Book getBook() { return book; }
    public void setBook(Book book) { this.book = book; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
}

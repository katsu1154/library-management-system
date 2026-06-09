package com.library.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "book_copies")
public class BookCopy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "copy_id")
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String copyCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CopyStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "publisher", "shelf", "authors", "categories"})
    private Book book;

    @Column(nullable = false)
    private int damagePercent = 0;

    public BookCopy() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCopyCode() { return copyCode; }
    public void setCopyCode(String copyCode) { this.copyCode = copyCode; }
    public CopyStatus getStatus() { return status; }
    public void setStatus(CopyStatus status) { this.status = status; }
    public Book getBook() { return book; }
    public void setBook(Book book) { this.book = book; }
    public int getDamagePercent() { return damagePercent; }
    public void setDamagePercent(int damagePercent) { this.damagePercent = damagePercent; }
}

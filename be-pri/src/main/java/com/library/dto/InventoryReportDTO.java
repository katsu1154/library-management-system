package com.library.dto;

public class InventoryReportDTO {
    private Long bookId;
    private String title;
    private String isbn;
    private int availableQuantity;
    private String status;

    public InventoryReportDTO() {}

    public InventoryReportDTO(Long bookId, String title, String isbn, int availableQuantity, String status) {
        this.bookId = bookId;
        this.title = title;
        this.isbn = isbn;
        this.availableQuantity = availableQuantity;
        this.status = status;
    }

    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }
    public int getAvailableQuantity() { return availableQuantity; }
    public void setAvailableQuantity(int availableQuantity) { this.availableQuantity = availableQuantity; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}

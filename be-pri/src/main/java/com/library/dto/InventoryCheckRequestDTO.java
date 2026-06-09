package com.library.dto;

public class InventoryCheckRequestDTO {
    private Long bookId;
    private Integer actualQuantity;
    private String note;

    public InventoryCheckRequestDTO() {}

    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }
    public Integer getActualQuantity() { return actualQuantity; }
    public void setActualQuantity(Integer actualQuantity) { this.actualQuantity = actualQuantity; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}

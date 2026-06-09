package com.library.service;

import com.library.dto.BookCopyRequest;
import com.library.entity.*;
import com.library.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BookCopyService {
    @Autowired
    private BookCopyRepository bookCopyRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private ShelfRepository shelfRepository;

    public List<BookCopy> getAll() {
        return bookCopyRepository.findAll();
    }

    public List<BookCopy> getByBookId(Long bookId) {
        return bookCopyRepository.findByBookId(bookId);
    }

    public BookCopy getById(Long id) {
        return bookCopyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("BookCopy not found"));
    }

    private boolean takesShelfSpace(CopyStatus status) {
        return status == CopyStatus.AVAILABLE || status == CopyStatus.RESERVED || status == CopyStatus.DAMAGED;
    }

    @Transactional
    public BookCopy create(BookCopyRequest request) {
        if (bookCopyRepository.existsByCopyCode(request.getCopyCode())) {
            throw new RuntimeException("CopyCode already exists!");
        }

        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new RuntimeException("Book not found"));

        if (takesShelfSpace(request.getStatus())) {
            Shelf shelf = book.getShelf();
            if (shelf.getCurrentCapacity() >= shelf.getMaxCapacity()) {
                throw new RuntimeException("Kệ sách đã đầy, không thể thêm bản sao mới!");
            }
            shelf.setCurrentCapacity(shelf.getCurrentCapacity() + 1);
            shelfRepository.save(shelf);
        }

        BookCopy copy = new BookCopy();
        copy.setBook(book);
        copy.setCopyCode(request.getCopyCode());
        copy.setStatus(request.getStatus());

        return bookCopyRepository.save(copy);
    }

    @Transactional
    public BookCopy updateStatus(Long id, CopyStatus newStatus) {
        BookCopy copy = getById(id);
        CopyStatus oldStatus = copy.getStatus();

        if (oldStatus == newStatus) {
            return copy;
        }

        boolean oldTookSpace = takesShelfSpace(oldStatus);
        boolean newTakesSpace = takesShelfSpace(newStatus);

        Shelf shelf = copy.getBook().getShelf();

        if (!oldTookSpace && newTakesSpace) {
            // Cần chỗ trên kệ
            if (shelf.getCurrentCapacity() >= shelf.getMaxCapacity()) {
                throw new RuntimeException("Kệ sách đã đầy, không thể nhận lại bản sao này!");
            }
            shelf.setCurrentCapacity(shelf.getCurrentCapacity() + 1);
            shelfRepository.save(shelf);
        } else if (oldTookSpace && !newTakesSpace) {
            // Trống chỗ trên kệ (Bị mượn hoặc Mất)
            shelf.setCurrentCapacity(Math.max(0, shelf.getCurrentCapacity() - 1));
            shelfRepository.save(shelf);
        }

        copy.setStatus(newStatus);
        return bookCopyRepository.save(copy);
    }

    @Transactional
    public void delete(Long id) {
        BookCopy copy = getById(id);
        if (takesShelfSpace(copy.getStatus())) {
            Shelf shelf = copy.getBook().getShelf();
            shelf.setCurrentCapacity(Math.max(0, shelf.getCurrentCapacity() - 1));
            shelfRepository.save(shelf);
        }
        bookCopyRepository.delete(copy);
    }
}

package com.library.service;

import com.library.dto.BookRequest;
import com.library.entity.*;
import com.library.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;

@Service
public class BookService {
    @Autowired
    private BookRepository bookRepository;
    
    @Autowired
    private PublisherRepository publisherRepository;
    
    @Autowired
    private ShelfRepository shelfRepository;
    
    @Autowired
    private AuthorRepository authorRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private BookCopyRepository bookCopyRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    public List<Book> getAll() {
        List<Book> books = bookRepository.findAll();
        // Lặp qua từng cuốn để đếm số sách còn trống
        for (Book book : books) {
            int available = (int) bookCopyRepository.countByBookIdAndStatus(book.getId(), CopyStatus.AVAILABLE);
            book.setAvailableCopies(available);
        }
        return books;
    }

    public Book getById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found!"));
        
        int available = (int) bookCopyRepository.countByBookIdAndStatus(book.getId(), CopyStatus.AVAILABLE);
        book.setAvailableCopies(available);
        
        return book;
    }

    public List<Book> searchBooks(String keyword, Long publisherId, Long categoryId, Long authorId) {
        List<Book> books = bookRepository.findAll(BookSpecification.search(keyword, publisherId, categoryId, authorId));
        // Lặp qua từng cuốn để đếm số sách còn trống
        for (Book book : books) {
            int available = (int) bookCopyRepository.countByBookIdAndStatus(book.getId(), CopyStatus.AVAILABLE);
            book.setAvailableCopies(available);
        }
        return books;
    }

    @Transactional
    public Book create(BookRequest request, MultipartFile coverImage) throws IOException {
        if (bookRepository.existsByIsbn(request.getIsbn())) {
            throw new RuntimeException("ISBN already exists!");
        }

        Book book = new Book();
        book.setTitle(request.getTitle());
        book.setIsbn(request.getIsbn());
        book.setPublicationYear(request.getPublicationYear());
        book.setDescription(request.getDescription());
        book.setPrice(request.getPrice());

        Publisher publisher = publisherRepository.findById(request.getPublisherId())
                .orElseThrow(() -> new RuntimeException("Publisher not found!"));
        book.setPublisher(publisher);

        Shelf shelf = shelfRepository.findById(request.getShelfId())
                .orElseThrow(() -> new RuntimeException("Shelf not found!"));
        book.setShelf(shelf);

        if (request.getAuthorIds() != null) {
            List<Author> authors = authorRepository.findAllById(request.getAuthorIds());
            book.setAuthors(new HashSet<>(authors));
        }

        if (request.getCategoryIds() != null) {
            List<Category> categories = categoryRepository.findAllById(request.getCategoryIds());
            book.setCategories(new HashSet<>(categories));
        }

        if (coverImage != null && !coverImage.isEmpty()) {
            String url = cloudinaryService.uploadImage(coverImage);
            book.setCoverImageUrl(url);
        }

        return bookRepository.save(book);
    }

    @Transactional
    public Book update(Long id, BookRequest request, MultipartFile coverImage) throws IOException {
        Book book = getById(id);

        if (!book.getIsbn().equals(request.getIsbn()) && bookRepository.existsByIsbn(request.getIsbn())) {
            throw new RuntimeException("ISBN already exists!");
        }

        book.setTitle(request.getTitle());
        book.setIsbn(request.getIsbn());
        book.setPublicationYear(request.getPublicationYear());
        book.setDescription(request.getDescription());
        book.setPrice(request.getPrice());

        Publisher publisher = publisherRepository.findById(request.getPublisherId())
                .orElseThrow(() -> new RuntimeException("Publisher not found!"));
        book.setPublisher(publisher);

        Shelf newShelf = shelfRepository.findById(request.getShelfId())
                .orElseThrow(() -> new RuntimeException("Shelf not found!"));

        // Nếu kệ thay đổi → cập nhật currentCapacity của kệ cũ và kệ mới
        Shelf oldShelf = book.getShelf();
        if (oldShelf != null && !oldShelf.getId().equals(newShelf.getId())) {
            List<CopyStatus> onShelf = Arrays.asList(CopyStatus.AVAILABLE, CopyStatus.RESERVED, CopyStatus.DAMAGED);
            int copyCount = (int) bookCopyRepository.countByBookIdAndStatusIn(id, onShelf);

            if (newShelf.getCurrentCapacity() + copyCount > newShelf.getMaxCapacity()) {
                throw new RuntimeException("Kệ '" + newShelf.getName() + "' không đủ sức chứa " + copyCount + " bản sao!");
            }

            oldShelf.setCurrentCapacity(Math.max(0, oldShelf.getCurrentCapacity() - copyCount));
            shelfRepository.save(oldShelf);

            newShelf.setCurrentCapacity(newShelf.getCurrentCapacity() + copyCount);
            shelfRepository.save(newShelf);
        }

        book.setShelf(newShelf);

        if (request.getAuthorIds() != null) {
            List<Author> authors = authorRepository.findAllById(request.getAuthorIds());
            book.setAuthors(new HashSet<>(authors));
        } else {
            book.getAuthors().clear();
        }

        if (request.getCategoryIds() != null) {
            List<Category> categories = categoryRepository.findAllById(request.getCategoryIds());
            book.setCategories(new HashSet<>(categories));
        } else {
            book.getCategories().clear();
        }

        if (coverImage != null && !coverImage.isEmpty()) {
            String url = cloudinaryService.uploadImage(coverImage);
            book.setCoverImageUrl(url);
        }

        return bookRepository.save(book);
    }

    public void delete(Long id) {
        Book book = getById(id);
        bookRepository.delete(book);
    }
}

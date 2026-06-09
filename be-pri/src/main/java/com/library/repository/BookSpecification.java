package com.library.repository;

import com.library.entity.Author;
import com.library.entity.Book;
import com.library.entity.Category;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public class BookSpecification {
    public static Specification<Book> search(String keyword, Long publisherId, Long categoryId, Long authorId) {
        return (root, query, cb) -> {
            query.distinct(true);
            Predicate p = cb.conjunction();

            if (keyword != null && !keyword.trim().isEmpty()) {
                String likeKeyword = "%" + keyword.trim().toLowerCase() + "%";
                Predicate titleMatch = cb.like(cb.lower(root.get("title")), likeKeyword);
                Predicate isbnMatch = cb.like(cb.lower(root.get("isbn")), likeKeyword);
                
                try {
                    Long idKeyword = Long.parseLong(keyword.trim());
                    Predicate idMatch = cb.equal(root.get("id"), idKeyword);
                    p = cb.and(p, cb.or(titleMatch, isbnMatch, idMatch));
                } catch (NumberFormatException e) {
                    p = cb.and(p, cb.or(titleMatch, isbnMatch));
                }
            }

            if (publisherId != null) {
                p = cb.and(p, cb.equal(root.get("publisher").get("id"), publisherId));
            }

            if (categoryId != null) {
                Join<Book, Category> categories = root.join("categories");
                p = cb.and(p, cb.equal(categories.get("id"), categoryId));
            }

            if (authorId != null) {
                Join<Book, Author> authors = root.join("authors");
                p = cb.and(p, cb.equal(authors.get("id"), authorId));
            }

            return p;
        };
    }
}

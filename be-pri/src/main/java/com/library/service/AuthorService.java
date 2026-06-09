package com.library.service;

import com.library.dto.AuthorRequest;
import com.library.entity.Author;
import com.library.repository.AuthorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthorService {
    @Autowired
    private AuthorRepository authorRepository;

    public List<Author> getAll() {
        return authorRepository.findAll();
    }

    public Author getById(Long id) {
        return authorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Author not found with id: " + id));
    }

    public Author create(AuthorRequest request) {
        Author author = new Author();
        author.setName(request.getName());
        author.setBiography(request.getBiography());
        return authorRepository.save(author);
    }

    public Author update(Long id, AuthorRequest request) {
        Author author = getById(id);
        author.setName(request.getName());
        author.setBiography(request.getBiography());
        return authorRepository.save(author);
    }

    public void delete(Long id) {
        Author author = getById(id);
        authorRepository.delete(author);
    }
}

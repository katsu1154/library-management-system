package com.library.service;

import com.library.dto.CategoryRequest;
import com.library.entity.Category;
import com.library.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;

    public List<Category> getAll() {
        return categoryRepository.findAll();
    }

    public Category getById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
    }

    public Category create(CategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new RuntimeException("Category name already exists: " + request.getName());
        }
        Category category = new Category();
        category.setName(request.getName());
        category.setDescription(request.getDescription());

        if (request.getParentId() != null) {
            Category parent = getById(request.getParentId());
            category.setParentCategory(parent);
        }

        return categoryRepository.save(category);
    }

    public Category update(Long id, CategoryRequest request) {
        Category category = getById(id);

        if (!category.getName().equals(request.getName()) && categoryRepository.existsByName(request.getName())) {
            throw new RuntimeException("Category name already exists: " + request.getName());
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        if (request.getParentId() != null) {
            if (request.getParentId().equals(id)) {
                throw new RuntimeException("Category cannot be its own parent!");
            }
            Category parent = getById(request.getParentId());
            category.setParentCategory(parent);
        } else {
            category.setParentCategory(null);
        }

        return categoryRepository.save(category);
    }

    public void delete(Long id) {
        Category category = getById(id);
        categoryRepository.delete(category);
    }
}

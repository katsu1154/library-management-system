package com.library.service;

import com.library.dto.ShelfRequest;
import com.library.entity.Shelf;
import com.library.repository.ShelfRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ShelfService {
    @Autowired
    private ShelfRepository shelfRepository;

    public List<Shelf> getAll() {
        return shelfRepository.findAll();
    }

    public Shelf getById(Long id) {
        return shelfRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shelf not found with id: " + id));
    }

    public Shelf create(ShelfRequest request) {
        if (shelfRepository.existsByName(request.getName())) {
            throw new RuntimeException("Shelf name already exists!");
        }
        Shelf shelf = new Shelf();
        shelf.setName(request.getName());
        shelf.setLocation(request.getLocation());
        shelf.setDescription(request.getDescription());
        shelf.setMaxCapacity(request.getMaxCapacity());
        shelf.setCurrentCapacity(0); // Starts empty
        return shelfRepository.save(shelf);
    }

    public Shelf update(Long id, ShelfRequest request) {
        Shelf shelf = getById(id);

        if (!shelf.getName().equals(request.getName()) && shelfRepository.existsByName(request.getName())) {
            throw new RuntimeException("Shelf name already exists!");
        }

        if (request.getMaxCapacity() < shelf.getCurrentCapacity()) {
            throw new RuntimeException("Max capacity cannot be less than current capacity!");
        }

        shelf.setName(request.getName());
        shelf.setLocation(request.getLocation());
        shelf.setDescription(request.getDescription());
        shelf.setMaxCapacity(request.getMaxCapacity());
        
        return shelfRepository.save(shelf);
    }

    public void delete(Long id) {
        Shelf shelf = getById(id);
        if (shelf.getCurrentCapacity() > 0) {
            throw new RuntimeException("Cannot delete shelf because it is not empty!");
        }
        shelfRepository.delete(shelf);
    }
}

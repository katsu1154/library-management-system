package com.library.service;

import com.library.dto.PublisherRequest;
import com.library.entity.Publisher;
import com.library.repository.PublisherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PublisherService {
    @Autowired
    private PublisherRepository publisherRepository;

    public List<Publisher> getAll() {
        return publisherRepository.findAll();
    }

    public Publisher getById(Long id) {
        return publisherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Publisher not found with id: " + id));
    }

    public Publisher create(PublisherRequest request) {
        if (publisherRepository.existsByName(request.getName())) {
            throw new RuntimeException("Publisher name already exists!");
        }
        Publisher publisher = new Publisher();
        publisher.setName(request.getName());
        publisher.setAddress(request.getAddress());
        publisher.setContactInfo(request.getContactInfo());
        return publisherRepository.save(publisher);
    }

    public Publisher update(Long id, PublisherRequest request) {
        Publisher publisher = getById(id);

        if (!publisher.getName().equals(request.getName()) && publisherRepository.existsByName(request.getName())) {
            throw new RuntimeException("Publisher name already exists!");
        }

        publisher.setName(request.getName());
        publisher.setAddress(request.getAddress());
        publisher.setContactInfo(request.getContactInfo());
        return publisherRepository.save(publisher);
    }

    public void delete(Long id) {
        Publisher publisher = getById(id);
        publisherRepository.delete(publisher);
    }
}

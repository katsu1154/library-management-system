package com.library.repository;

import com.library.entity.ImportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.EntityGraph;
import java.util.List;

@Repository
public interface ImportTicketRepository extends JpaRepository<ImportTicket, Long> {
    @EntityGraph(attributePaths = {"details", "details.book"})
    List<ImportTicket> findAll();
}

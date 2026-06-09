package com.library.repository;

import com.library.entity.InventoryCheckTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryCheckTicketRepository extends JpaRepository<InventoryCheckTicket, Long> {
}

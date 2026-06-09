package com.library.service;

import com.library.dto.*;
import com.library.entity.*;
import com.library.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class WarehouseService {

    @Autowired
    private ImportTicketRepository importTicketRepository;

    @Autowired
    private InventoryCheckTicketRepository inventoryCheckTicketRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private BookCopyRepository bookCopyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ShelfRepository shelfRepository;

    @Transactional
    public ImportTicket createImportTicket(Long warehouseManagerId, List<ImportRequestDTO> items, String note) {
        User manager = userRepository.findById(warehouseManagerId).orElseThrow(() -> new RuntimeException("User not found"));
        
        ImportTicket ticket = new ImportTicket();
        ticket.setWarehouseManager(manager);
        ticket.setImportDate(LocalDateTime.now());
        ticket.setStatus(ImportStatus.PENDING);
        ticket.setNote(note);

        BigDecimal totalCost = BigDecimal.ZERO;
        List<ImportTicketDetail> details = new ArrayList<>();

        for (ImportRequestDTO item : items) {
            Book book = bookRepository.findById(item.getBookId()).orElseThrow(() -> new RuntimeException("Book not found"));
            ImportTicketDetail detail = new ImportTicketDetail();
            detail.setImportTicket(ticket);
            detail.setBook(book);
            detail.setQuantity(item.getQuantity());
            detail.setUnitPrice(item.getUnitPrice());
            details.add(detail);
            
            BigDecimal cost = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            totalCost = totalCost.add(cost);
        }

        ticket.setDetails(details);
        ticket.setTotalCost(totalCost);

        return importTicketRepository.save(ticket);
    }

    @Transactional
    public ImportTicket approveImportTicket(Long accountantId, Long ticketId, BigDecimal actualCost, String invoiceNumber) {
        User accountant = userRepository.findById(accountantId).orElseThrow(() -> new RuntimeException("User not found"));
        ImportTicket ticket = importTicketRepository.findById(ticketId).orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (ticket.getStatus() != ImportStatus.PENDING) {
            throw new RuntimeException("Phiếu nhập không ở trạng thái chờ duyệt!");
        }

        ticket.setAccountant(accountant);
        ticket.setStatus(ImportStatus.APPROVED);
        
        if (actualCost != null) {
            ticket.setTotalCost(actualCost);
        }
        if (invoiceNumber != null) {
            ticket.setInvoiceNumber(invoiceNumber);
        }

        // Sinh tự động BookCopy và cập nhật Kệ sách
        for (ImportTicketDetail detail : ticket.getDetails()) {
            Book book = detail.getBook();
            Shelf shelf = book.getShelf();

            // BUG13 FIX: Kiểm tra null cho shelf trước khi truy cập
            if (shelf == null) {
                throw new RuntimeException("Đầu sách '" + book.getTitle() + "' chưa được gán vào kệ sách nào. Vui lòng gán kệ sách trước khi duyệt nhập kho!");
            }

            // Kiểm tra sức chứa của kệ
            if (shelf.getCurrentCapacity() + detail.getQuantity() > shelf.getMaxCapacity()) {
                throw new RuntimeException("Kệ sách của đầu sách '" + book.getTitle() + "' không đủ sức chứa!");
            }

            shelf.setCurrentCapacity(shelf.getCurrentCapacity() + detail.getQuantity());
            shelfRepository.save(shelf);

            long currentCount = bookCopyRepository.countByBookId(book.getId());
            for (int i = 1; i <= detail.getQuantity(); i++) {
                BookCopy copy = new BookCopy();
                copy.setBook(book);
                copy.setStatus(CopyStatus.AVAILABLE);
                copy.setCopyCode("TLU-B" + book.getId() + "-C" + String.format("%03d", currentCount + i));
                bookCopyRepository.save(copy);
            }
        }

        return importTicketRepository.save(ticket);
    }

    @Transactional
    public ImportTicket rejectImportTicket(Long accountantId, Long ticketId, String rejectReason) {
        User accountant = userRepository.findById(accountantId).orElseThrow(() -> new RuntimeException("User not found"));
        ImportTicket ticket = importTicketRepository.findById(ticketId).orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (ticket.getStatus() != ImportStatus.PENDING) {
            throw new RuntimeException("Phiếu nhập không ở trạng thái chờ duyệt!");
        }

        ticket.setAccountant(accountant);
        ticket.setStatus(ImportStatus.REJECTED);
        ticket.setRejectReason(rejectReason);
        return importTicketRepository.save(ticket);
    }

    public List<ImportTicket> getImportHistory() {
        return importTicketRepository.findAll();
    }

    @Transactional
    public InventoryCheckTicket createInventoryCheck(Long warehouseManagerId, List<InventoryCheckRequestDTO> items, String note) {
        User manager = userRepository.findById(warehouseManagerId).orElseThrow(() -> new RuntimeException("User not found"));

        InventoryCheckTicket ticket = new InventoryCheckTicket();
        ticket.setWarehouseManager(manager);
        ticket.setCheckDate(LocalDate.now());
        ticket.setNote(note);

        List<InventoryCheckDetail> details = new ArrayList<>();
        List<CopyStatus> onShelfStatuses = Arrays.asList(CopyStatus.AVAILABLE, CopyStatus.RESERVED, CopyStatus.DAMAGED);

        for (InventoryCheckRequestDTO item : items) {
            Book book = bookRepository.findById(item.getBookId()).orElseThrow(() -> new RuntimeException("Book not found"));
            long systemQuantity = bookCopyRepository.countByBookIdAndStatusIn(book.getId(), onShelfStatuses);

            InventoryCheckDetail detail = new InventoryCheckDetail();
            detail.setInventoryCheckTicket(ticket);
            detail.setBook(book);
            detail.setSystemQuantity((int) systemQuantity);
            detail.setActualQuantity(item.getActualQuantity());
            detail.setDifference(item.getActualQuantity() - (int) systemQuantity);
            detail.setNote(item.getNote());
            details.add(detail);
        }

        ticket.setDetails(details);
        return inventoryCheckTicketRepository.save(ticket);
    }

    public List<InventoryCheckTicket> getInventoryHistory() {
        return inventoryCheckTicketRepository.findAll();
    }

    public List<InventoryReportDTO> getLowStockReport() {
        List<Book> allBooks = bookRepository.findAll();
        List<InventoryReportDTO> report = new ArrayList<>();

        for (Book book : allBooks) {
            long availableQty = bookCopyRepository.countByBookIdAndStatusIn(book.getId(), Arrays.asList(CopyStatus.AVAILABLE));
            String status = availableQty < 5 ? "WARNING_LOW_STOCK" : "SAFE";
            report.add(new InventoryReportDTO(book.getId(), book.getTitle(), book.getIsbn(), (int) availableQty, status));
        }

        return report;
    }
}

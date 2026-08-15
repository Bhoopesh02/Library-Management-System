package com.library.service;

import com.library.model.Fine;
import com.library.repository.FineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class FineService {

    @Autowired
    private FineRepository fineRepository;

    @Value("${app.fine.per-day:5}")
    private double finePerDay;

    public Fine createFine(String transactionId, String userId, long overdueDays) {
        if (overdueDays <= 0) return null;

        double amount = overdueDays * finePerDay;
        
        Fine fine = new Fine();
        fine.setTransactionId(transactionId);
        fine.setUserId(userId);
        fine.setAmount(amount);
        fine.setStatus(Fine.Status.UNPAID);
        fine.setCreatedAt(LocalDateTime.now());
                
        return fineRepository.save(fine);
    }

    public Page<Fine> getAllFines(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return fineRepository.findAll(pageable);
    }

    public Page<Fine> getFinesByUser(String userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return fineRepository.findByUserId(userId, pageable);
    }

    public Fine payFine(String fineId) {
        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new RuntimeException("Fine not found"));

        if (fine.getStatus() == Fine.Status.PAID) {
            throw new RuntimeException("Fine is already paid");
        }

        fine.setStatus(Fine.Status.PAID);
        fine.setPaidAt(LocalDateTime.now());
        
        return fineRepository.save(fine);
    }
}

package com.library.controller;

import com.library.dto.ApiResponse;
import com.library.model.Transaction;
import com.library.repository.BookRepository;
import com.library.repository.FineRepository;
import com.library.repository.TransactionRepository;
import com.library.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private FineRepository fineRepository;

    @GetMapping("/admin")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalBooks", bookRepository.count());
        stats.put("totalUsers", userRepository.count());
        stats.put("totalTransactions", transactionRepository.count());
        stats.put("activeFines", fineRepository.count());
        
        // Count specific statuses could be optimized with aggregations in a real app
        long issuedCount = transactionRepository.findAll().stream()
                .filter(t -> t.getStatus() == Transaction.Status.ISSUED || t.getStatus() == Transaction.Status.OVERDUE)
                .count();
                
        stats.put("currentlyIssued", issuedCount);
        
        return ResponseEntity.ok(ApiResponse.success("Dashboard stats retrieved", stats));
    }
}

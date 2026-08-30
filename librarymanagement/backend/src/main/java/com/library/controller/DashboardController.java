package com.library.controller;

import com.library.dto.ApiResponse;
import com.library.model.Book;
import com.library.model.Transaction;
import com.library.repository.BookRepository;
import com.library.repository.FineRepository;
import com.library.repository.TransactionRepository;
import com.library.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

    @PreAuthorize("@securityValidationService.isCurrentlyAdmin(authentication.name)")
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

        // Activity Data (last 6 months)
        java.time.LocalDate sixMonthsAgo = java.time.LocalDate.now().minusMonths(5).withDayOfMonth(1);
        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("MMM");
        
        Map<String, Long> activityMap = new java.util.LinkedHashMap<>();
        for (int i = 5; i >= 0; i--) {
            java.time.LocalDate month = java.time.LocalDate.now().minusMonths(i);
            activityMap.put(month.format(formatter), 0L);
        }

        transactionRepository.findAll().stream()
                .filter(t -> t.getIssueDate() != null && !t.getIssueDate().isBefore(sixMonthsAgo))
                .forEach(t -> {
                    String monthStr = t.getIssueDate().format(formatter);
                    if (activityMap.containsKey(monthStr)) {
                        activityMap.put(monthStr, activityMap.get(monthStr) + 1);
                    }
                });

        java.util.List<Map<String, Object>> activityData = new java.util.ArrayList<>();
        for (Map.Entry<String, Long> entry : activityMap.entrySet()) {
            Map<String, Object> dataPoint = new HashMap<>();
            dataPoint.put("name", entry.getKey());
            dataPoint.put("issued", entry.getValue());
            activityData.add(dataPoint);
        }
        stats.put("activityData", activityData);

        // Category Data
        Map<String, Long> categoryCountMap = bookRepository.findAll().stream()
                .filter(b -> b.getCategory() != null)
                .collect(java.util.stream.Collectors.groupingBy(Book::getCategory, java.util.stream.Collectors.counting()));

        java.util.List<Map<String, Object>> categoryData = new java.util.ArrayList<>();
        for (Map.Entry<String, Long> entry : categoryCountMap.entrySet()) {
            Map<String, Object> dataPoint = new HashMap<>();
            dataPoint.put("name", entry.getKey());
            dataPoint.put("value", entry.getValue());
            categoryData.add(dataPoint);
        }
        stats.put("categoryData", categoryData);
        
        return ResponseEntity.ok(ApiResponse.success("Dashboard stats retrieved", stats));
    }
}

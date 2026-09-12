package com.library.controller;

import com.library.dto.ApiResponse;
import com.library.dto.IssueRequest;
import com.library.model.Transaction;
import com.library.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @PreAuthorize("@securityValidationService.isCurrentlyAdminOrMaster(authentication.name)")
    @PostMapping("/issue")
    public ResponseEntity<ApiResponse<Transaction>> issueBook(@Valid @RequestBody IssueRequest request) {
        Transaction transaction = transactionService.issueBook(request);
        return ResponseEntity.ok(ApiResponse.success("Book issued successfully", transaction));
    }

    @PreAuthorize("@securityValidationService.isCurrentlyAdminOrMaster(authentication.name)")
    @PostMapping("/return/{id}")
    public ResponseEntity<ApiResponse<Transaction>> returnBook(@PathVariable("id") String id) {
        Transaction transaction = transactionService.returnBook(id);
        return ResponseEntity.ok(ApiResponse.success("Book returned successfully", transaction));
    }

    @PreAuthorize("@securityValidationService.isCurrentlyAdminOrMaster(authentication.name)")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<Transaction>>> getAllTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("Transactions retrieved", transactionService.getAllTransactions(page, size)));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MASTER_ADMIN') or #userId == authentication.principal.user.id")
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<Page<Transaction>>> getTransactionsByUser(
            @PathVariable("userId") String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("User transactions retrieved", transactionService.getTransactionsByUser(userId, page, size)));
    }
}

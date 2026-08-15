package com.library.service;

import com.library.dto.IssueRequest;
import com.library.model.Book;
import com.library.model.Transaction;
import com.library.model.User;
import com.library.repository.BookRepository;
import com.library.repository.TransactionRepository;
import com.library.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FineService fineService;

    public Transaction issueBook(IssueRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        if (user.getStatus() != User.Status.ACTIVE) {
            throw new RuntimeException("Cannot issue book to an inactive user");
        }

        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new RuntimeException("Book not found"));

        if (book.getAvailableCopies() <= 0) {
            throw new RuntimeException("Book is currently unavailable (no copies left)");
        }

        if (request.getDueDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Due date cannot be in the past");
        }

        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        Transaction transaction = new Transaction();
        transaction.setUserId(user.getId());
        transaction.setBookId(book.getId());
        transaction.setIssueDate(LocalDate.now());
        transaction.setDueDate(request.getDueDate());
        transaction.setStatus(Transaction.Status.ISSUED);

        return transactionRepository.save(transaction);
    }

    public Transaction returnBook(String transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (transaction.getStatus() != Transaction.Status.ISSUED && transaction.getStatus() != Transaction.Status.OVERDUE) {
            throw new RuntimeException("Transaction is already returned or in an invalid state");
        }

        transaction.setReturnDate(LocalDate.now());
        transaction.setStatus(Transaction.Status.RETURNED);

        long overdueDays = ChronoUnit.DAYS.between(transaction.getDueDate(), transaction.getReturnDate());
        if (overdueDays > 0) {
            fineService.createFine(transaction.getId(), transaction.getUserId(), overdueDays);
        }

        Book book = bookRepository.findById(transaction.getBookId())
                .orElseThrow(() -> new RuntimeException("Book not found"));
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);

        return transactionRepository.save(transaction);
    }

    public Page<Transaction> getAllTransactions(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("issueDate").descending());
        return transactionRepository.findAll(pageable);
    }

    public Page<Transaction> getTransactionsByUser(String userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("issueDate").descending());
        return transactionRepository.findByUserId(userId, pageable);
    }
}

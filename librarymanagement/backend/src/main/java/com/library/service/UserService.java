package com.library.service;

import com.library.exception.FeatureDisabledException;
import com.library.exception.InvalidCredentialsException;
import com.library.model.Fine;
import com.library.model.Transaction;
import com.library.model.User;
import com.library.repository.FineRepository;
import com.library.repository.OtpRepository;
import com.library.repository.RefreshTokenRepository;
import com.library.repository.TransactionRepository;
import com.library.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private FineRepository fineRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private OtpRepository otpRepository;

    @Value("${app.admin.master-key:}")
    private String adminMasterKey;

    public Page<User> getAllUsers(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        if (search != null && !search.trim().isEmpty()) {
            return userRepository.findByNameContainingIgnoreCase(search, pageable);
        }
        return userRepository.findAll(pageable);
    }

    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateUserStatus(String id, User.Status status) {
        User user = getUserById(id);
        if (user.getRole() == User.Role.ADMIN && status == User.Status.INACTIVE) {
            throw new RuntimeException("Cannot deactivate an admin user");
        }
        user.setStatus(status);
        return userRepository.save(user);
    }

    public void deleteUserAccount(String id, String currentAdminEmail) {
        User currentAdmin = userRepository.findByEmail(currentAdminEmail)
                .orElseThrow(() -> new RuntimeException("Current admin not found"));
        if (!currentAdmin.isMasterAdmin()) {
            throw new RuntimeException("Only Master Admins are authorized to delete accounts.");
        }

        User user = getUserById(id);

        if (user.getEmail() != null && user.getEmail().equalsIgnoreCase(currentAdminEmail)) {
            throw new RuntimeException("You cannot delete your own logged-in admin account.");
        }

        // For regular users, verify they have no active/overdue loans or unpaid fines
        if (user.getRole() == User.Role.USER) {
            List<Transaction> activeLoans = transactionRepository.findByUserIdAndStatus(id, Transaction.Status.ISSUED);
            List<Transaction> overdueLoans = transactionRepository.findByUserIdAndStatus(id, Transaction.Status.OVERDUE);
            if (!activeLoans.isEmpty() || !overdueLoans.isEmpty()) {
                throw new RuntimeException("Cannot delete user with active or overdue book loans. Please ensure all books are returned first.");
            }

            List<Fine> unpaidFines = fineRepository.findByUserIdAndStatus(id, Fine.Status.UNPAID);
            if (!unpaidFines.isEmpty()) {
                throw new RuntimeException("Cannot delete user with unpaid fines. Please clear all pending fines first.");
            }
        }

        // Clean up associated tokens
        refreshTokenRepository.deleteByUserId(id);
        if (user.getEmail() != null) {
            otpRepository.deleteByEmail(user.getEmail());
        }

        userRepository.delete(user);
        logger.info("Account '{}' (Role: {}) successfully deleted by admin '{}'", user.getEmail(), user.getRole(), currentAdminEmail);
    }
}


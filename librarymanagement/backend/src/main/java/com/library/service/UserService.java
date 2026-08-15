package com.library.service;

import com.library.model.User;
import com.library.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

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
}

package com.library.security;

import com.library.model.User;
import com.library.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service("securityValidationService")
public class SecurityValidationService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Re-validates the user's role from the database.
     * This avoids trusting a potentially stale JWT for critical actions.
     *
     * @param username the username (email) extracted from the authentication principal
     * @return true if the user still exists and their current DB role is ADMIN
     */
    public boolean isCurrentlyAdmin(String username) {
        Optional<User> userOpt = userRepository.findByEmail(username);
        if (userOpt.isEmpty()) {
            return false; // User deleted
        }
        
        User user = userOpt.get();
        return user.getRole() == User.Role.ADMIN && user.getStatus() == User.Status.ACTIVE;
    }
}

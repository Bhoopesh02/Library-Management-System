package com.library.security;

import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Iterator;

@Service
public class RateLimiterService {

    // Maps client IP to a list of timestamps of registration attempts
    private final ConcurrentHashMap<String, List<Long>> attemptHistory = new ConcurrentHashMap<>();
    
    // Maps email to login attempt tracking for exponential backoff
    private final ConcurrentHashMap<String, LoginAttemptData> loginAttempts = new ConcurrentHashMap<>();
    
    private static final int MAX_ATTEMPTS = 5;
    private static final long TIME_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
    private static final long MAX_BACKOFF_MS = 15 * 60 * 1000; // 15 mins
    private static final long RESET_WINDOW_MS = 15 * 60 * 1000; // 15 mins inactivity resets count
    
    public static class LoginAttemptData {
        public final int attempts;
        public final long lastAttemptTime;
        public final long nextAllowedAttempt;

        public LoginAttemptData(int attempts, long lastAttemptTime, long nextAllowedAttempt) {
            this.attempts = attempts;
            this.lastAttemptTime = lastAttemptTime;
            this.nextAllowedAttempt = nextAllowedAttempt;
        }
    }

    public boolean tryConsume(String ip) {
        attemptHistory.putIfAbsent(ip, new ArrayList<>());
        List<Long> list = attemptHistory.get(ip);
        
        synchronized (list) {
            long currentTime = System.currentTimeMillis();
            
            // Clean up old entries
            list.removeIf(timestamp -> currentTime - timestamp > TIME_WINDOW_MS);
            
            if (list.size() < MAX_ATTEMPTS) {
                list.add(currentTime);
                return true;
            }
            return false;
        }
    }

    public void checkLoginAllowed(String email) {
        LoginAttemptData data = loginAttempts.get(email);
        if (data != null && System.currentTimeMillis() < data.nextAllowedAttempt) {
            throw new com.library.exception.InvalidCredentialsException("Invalid email or password");
        }
    }

    public void recordFailedLogin(String email) {
        long now = System.currentTimeMillis();
        loginAttempts.compute(email, (k, v) -> {
            int newAttempts = 1;
            if (v != null && (now - v.lastAttemptTime) < RESET_WINDOW_MS) {
                newAttempts = v.attempts + 1;
            }
            
            // Exponential backoff: 2^newAttempts seconds
            long delayMs = (long) Math.pow(2, newAttempts) * 1000;
            if (delayMs > MAX_BACKOFF_MS) {
                delayMs = MAX_BACKOFF_MS;
            }
            
            return new LoginAttemptData(newAttempts, now, now + delayMs);
        });
    }

    public void resetLoginAttempts(String email) {
        loginAttempts.remove(email);
    }
}

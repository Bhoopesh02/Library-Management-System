package com.library.security;

import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Scheduled;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Iterator;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class RateLimiterService {
    private static final Logger logger = LoggerFactory.getLogger(RateLimiterService.class);

    // Maps client IP to a list of timestamps of registration attempts
    private final ConcurrentHashMap<String, List<Long>> attemptHistory = new ConcurrentHashMap<>();
    
    // Maps email to login attempt tracking for exponential backoff
    private final ConcurrentHashMap<String, LoginAttemptData> loginAttempts = new ConcurrentHashMap<>();
    
    // Maps client IP to a list of timestamps of OTP requests
    private final ConcurrentHashMap<String, List<Long>> otpAttemptHistory = new ConcurrentHashMap<>();
    
    // Maps email to a list of timestamps of OTP requests (daily limit)
    private final ConcurrentHashMap<String, List<Long>> dailyEmailOtpHistory = new ConcurrentHashMap<>();
    
    private static final int MAX_ATTEMPTS = 5;
    private static final int MAX_OTP_ATTEMPTS = 3;
    private static final int MAX_DAILY_EMAIL_OTP_ATTEMPTS = 5;
    private static final long TIME_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
    private static final long DAILY_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
    private static final long MAX_BACKOFF_MS = 15 * 60 * 1000; // 15 mins
    private static final long RESET_WINDOW_MS = 15 * 60 * 1000; // 15 mins inactivity resets count
    
    @Scheduled(fixedRate = 3600000) // Run every hour
    public void cleanupStaleEntries() {
        long currentTime = System.currentTimeMillis();
        
        attemptHistory.entrySet().removeIf(entry -> {
            synchronized (entry.getValue()) {
                entry.getValue().removeIf(timestamp -> currentTime - timestamp > TIME_WINDOW_MS);
                return entry.getValue().isEmpty();
            }
        });
        
        otpAttemptHistory.entrySet().removeIf(entry -> {
            synchronized (entry.getValue()) {
                entry.getValue().removeIf(timestamp -> currentTime - timestamp > TIME_WINDOW_MS);
                return entry.getValue().isEmpty();
            }
        });
        
        dailyEmailOtpHistory.entrySet().removeIf(entry -> {
            synchronized (entry.getValue()) {
                entry.getValue().removeIf(timestamp -> currentTime - timestamp > DAILY_WINDOW_MS);
                return entry.getValue().isEmpty();
            }
        });
        
        loginAttempts.entrySet().removeIf(entry -> currentTime > entry.getValue().nextAllowedAttempt + RESET_WINDOW_MS);
    }
    
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
            logger.warn("[SECURITY] [type=RATE_LIMIT] [ip={}] [endpoint=register] - IP exceeded registration rate limit", ip);
            return false;
        }
    }

    public boolean tryConsumeOtp(String ip) {
        otpAttemptHistory.putIfAbsent(ip, new ArrayList<>());
        List<Long> list = otpAttemptHistory.get(ip);
        
        synchronized (list) {
            long currentTime = System.currentTimeMillis();
            
            // Clean up old entries
            list.removeIf(timestamp -> currentTime - timestamp > TIME_WINDOW_MS);
            
            if (list.size() < MAX_OTP_ATTEMPTS) {
                list.add(currentTime);
                return true;
            }
            logger.warn("[SECURITY] [type=RATE_LIMIT] [ip={}] [endpoint=otp] - IP exceeded OTP request rate limit", ip);
            return false;
        }
    }

    public void checkLoginAllowed(String email) {
        LoginAttemptData data = loginAttempts.get(email);
        if (data != null && System.currentTimeMillis() < data.nextAllowedAttempt) {
            logger.warn("[SECURITY] [type=ACCOUNT_LOCKOUT] [email={}] - Login locked out due to exponential backoff", email);
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

    public boolean tryConsumeDailyEmailOtp(String email) {
        dailyEmailOtpHistory.putIfAbsent(email, new ArrayList<>());
        List<Long> list = dailyEmailOtpHistory.get(email);
        
        synchronized (list) {
            long currentTime = System.currentTimeMillis();
            
            // Clean up old entries (safety check)
            list.removeIf(timestamp -> currentTime - timestamp > DAILY_WINDOW_MS);
            
            if (list.size() < MAX_DAILY_EMAIL_OTP_ATTEMPTS) {
                list.add(currentTime);
                return true;
            }
            logger.warn("[SECURITY] [type=RATE_LIMIT] [email={}] [endpoint=otp] - Email exceeded daily OTP request limit", email);
            return false;
        }
    }
}

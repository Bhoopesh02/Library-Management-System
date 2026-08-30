package com.library.security;

import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service to manage blocked access tokens (e.g., after logout).
 * 
 * IMPORTANT: This blocklist is in-memory and instance-local. It will NOT work correctly 
 * if the application is deployed across multiple instances/pods behind a load balancer, 
 * since a token blocklisted on one instance remains valid on others. 
 * If horizontal scaling is needed, this should be migrated to a shared store 
 * (like Redis, or a MongoDB collection with a TTL index).
 */
@Service
@EnableScheduling
public class TokenBlocklistService {

    // Map of token -> expiration time (in milliseconds)
    private final Map<String, Long> blocklist = new ConcurrentHashMap<>();

    /**
     * Add a token to the blocklist.
     * @param token the JWT access token
     * @param expirationDate the time when the token naturally expires
     */
    public void blockToken(String token, Date expirationDate) {
        blocklist.put(token, expirationDate.getTime());
    }

    /**
     * Check if a token is blocklisted.
     * @param token the JWT access token
     * @return true if the token is in the blocklist
     */
    public boolean isBlocklisted(String token) {
        Long expirationTime = blocklist.get(token);
        if (expirationTime != null) {
            // Check if the token has naturally expired anyway. If so, we can consider it blocklisted
            // but we don't necessarily have to since it will fail expiration checks.
            return true;
        }
        return false;
    }

    /**
     * Scheduled task to clean up naturally expired tokens from the blocklist.
     * Runs every 15 minutes to match the token lifespan and clear up memory.
     */
    @Scheduled(fixedRate = 900000) // 15 minutes
    public void cleanupBlocklist() {
        long now = System.currentTimeMillis();
        blocklist.entrySet().removeIf(entry -> entry.getValue() < now);
    }
}

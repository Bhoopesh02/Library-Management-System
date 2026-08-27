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
    
    private static final int MAX_ATTEMPTS = 5;
    private static final long TIME_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

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
}

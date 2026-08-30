package com.library.security;

import com.library.model.RefreshToken;
import com.library.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {

    // 7 days in milliseconds
    private static final long REFRESH_TOKEN_EXPIRATION_MS = 604800000L;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    public RefreshToken createRefreshToken(String userId) {
        // Attempt to create a refresh token with basic retry logic for collision
        int maxRetries = 3;
        for (int i = 0; i < maxRetries; i++) {
            try {
                RefreshToken refreshToken = new RefreshToken();
                refreshToken.setUserId(userId);
                refreshToken.setExpiryDate(new Date(System.currentTimeMillis() + REFRESH_TOKEN_EXPIRATION_MS));
                refreshToken.setToken(UUID.randomUUID().toString());

                return refreshTokenRepository.save(refreshToken);
            } catch (DuplicateKeyException e) {
                // If by some astronomical chance we generated a duplicate UUID, retry
                if (i == maxRetries - 1) {
                    throw new RuntimeException("Failed to generate a unique refresh token");
                }
            }
        }
        return null;
    }

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().before(new Date())) {
            refreshTokenRepository.delete(token);
            throw new RuntimeException("Refresh token was expired. Please make a new signin request");
        }
        return token;
    }

    public void deleteByUserId(String userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }
    
    public void deleteByToken(String token) {
        refreshTokenRepository.findByToken(token).ifPresent(refreshTokenRepository::delete);
    }

    public RefreshToken rotateRefreshToken(RefreshToken oldToken) {
        // Create and successfully persist the new refresh token FIRST
        RefreshToken newToken = createRefreshToken(oldToken.getUserId());
        // Only delete the old one after the new one is confirmed saved
        refreshTokenRepository.delete(oldToken);
        return newToken;
    }
}

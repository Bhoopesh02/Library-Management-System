package com.library.controller;

import com.library.dto.ApiResponse;
import com.library.dto.AuthResponse;
import com.library.dto.LoginRequest;
import com.library.dto.RegisterAdminRequest;
import com.library.dto.RegisterRequest;
import com.library.dto.SendOtpRequest;
import com.library.dto.ForgotPasswordRequest;
import com.library.dto.ResetPasswordRequest;
import com.library.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Value("${app.admin.trust-proxy-headers:false}")
    private boolean trustProxyHeaders;

    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<Void>> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        authService.sendRegistrationOtp(request);
        return ResponseEntity.ok(ApiResponse.success("OTP sent to email successfully", null));
    }

    @PostMapping("/forgot-password-otp")
    public ResponseEntity<ApiResponse<Void>> forgotPasswordOtp(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.sendForgotPasswordOtp(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset OTP sent to email successfully", null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully", null));
    }

    @PostMapping("/register-admin")
    public ResponseEntity<ApiResponse<AuthResponse>> registerAdmin(@Valid @RequestBody RegisterAdminRequest request, HttpServletRequest httpRequest) {
        String clientIp = httpRequest.getRemoteAddr();
        
        if (trustProxyHeaders) {
            String xForwardedFor = httpRequest.getHeader("X-Forwarded-For");
            if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                clientIp = xForwardedFor.split(",")[0].trim();
            }
        }
        
        AuthResponse response = authService.registerAdmin(request, clientIp);
        return ResponseEntity.ok(ApiResponse.success("Admin registration successful", response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.registerUser(request);
        return ResponseEntity.ok(ApiResponse.success("Registration successful", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }
    
    @Autowired
    private com.library.security.RefreshTokenService refreshTokenService;
    
    @Autowired
    private com.library.security.JwtUtil jwtUtil;
    
    @Autowired
    private com.library.security.UserDetailsServiceImpl userDetailsService;

    @Autowired
    private com.library.repository.UserRepository userRepository;

    @Autowired
    private com.library.security.TokenBlocklistService tokenBlocklistService;

    // Logout now revokes the refresh token AND blocklists the access token
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @Valid @RequestBody com.library.dto.TokenRefreshRequest request,
            jakarta.servlet.http.HttpServletRequest httpRequest) {
        
        // 1. Revoke refresh token
        refreshTokenService.deleteByToken(request.getRefreshToken());
        
        // 2. Blocklist current access token
        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);
            try {
                java.util.Date expiration = jwtUtil.extractExpiration(jwt);
                tokenBlocklistService.blockToken(jwt, expiration);
            } catch (Exception e) {
                // Token already expired or invalid, ignore
            }
        }
        
        return ResponseEntity.ok(ApiResponse.success("Logout successful", null));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<com.library.dto.TokenRefreshResponse>> refreshToken(@Valid @RequestBody com.library.dto.TokenRefreshRequest request) {
        return refreshTokenService.findByToken(request.getRefreshToken())
                .map(refreshTokenService::verifyExpiration)
                .map(oldRefreshToken -> {
                    // Refresh token is valid. Rotate it.
                    com.library.model.RefreshToken newRefreshToken = refreshTokenService.rotateRefreshToken(oldRefreshToken);
                    
                    String email = userRepository.findById(newRefreshToken.getUserId())
                            .orElseThrow(() -> new RuntimeException("User not found"))
                            .getEmail();
                            
                    org.springframework.security.core.userdetails.UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                    
                    String token = jwtUtil.generateToken(userDetails);
                    return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", 
                            new com.library.dto.TokenRefreshResponse(token, newRefreshToken.getToken())));
                })
                .orElseThrow(() -> {
                    // Token not found in DB. Since we delete tokens upon use (rotation), 
                    // if someone tries to use a token that is not in the DB, it's either 
                    // a logged-out token or an already-used token (potential theft).
                    // As a precaution, we could invalidate ALL refresh tokens for the user here
                    // if we were passing the userId in the request or extracting it from an expired JWT.
                    // For now, we reject the request with 401.
                    return new org.springframework.web.server.ResponseStatusException(
                            org.springframework.http.HttpStatus.UNAUTHORIZED, 
                            "Refresh token is invalid or has already been used!");
                });
    }
}

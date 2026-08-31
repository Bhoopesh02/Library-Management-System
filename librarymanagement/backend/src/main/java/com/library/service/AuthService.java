package com.library.service;

import com.library.dto.AuthResponse;
import com.library.dto.LoginRequest;
import com.library.dto.RegisterAdminRequest;
import com.library.dto.RegisterRequest;
import com.library.exception.DuplicateResourceException;
import com.library.exception.FeatureDisabledException;
import com.library.exception.InvalidCredentialsException;
import com.library.exception.RateLimitExceededException;
import com.library.model.User;
import com.library.model.OtpToken;
import com.library.repository.UserRepository;
import com.library.repository.OtpRepository;
import com.library.dto.SendOtpRequest;
import com.library.security.JwtUtil;
import com.library.security.RateLimiterService;
import com.library.security.RefreshTokenService;
import com.library.security.UserDetailsImpl;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class AuthService {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OtpRepository otpRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private RateLimiterService rateLimiterService;

    @Value("${app.admin.secret-key:}")
    private String adminSecretKey;

    @Value("${app.admin.registration-enabled:true}")
    private boolean registrationEnabled;

    @Value("${app.seed-default-admin:false}")
    private boolean seedDefaultAdmin;

    @Value("${app.otp.expiration-minutes:5}")
    private int otpExpirationMinutes;

    @PostConstruct
    public void init() {
        if (adminSecretKey == null || adminSecretKey.trim().isEmpty()) {
            logger.warn("=========================================================");
            logger.warn("WARNING: ADMIN_REGISTRATION_SECRET is not set or empty.");
            logger.warn("Admin registration feature has been forcibly DISABLED.");
            logger.warn("=========================================================");
            this.registrationEnabled = false;
        }

        if (seedDefaultAdmin && userRepository.findByEmail("admin@library.com").isEmpty()) {
            User admin = new User();
            admin.setName("Library Admin");
            admin.setEmail("admin@library.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(User.Role.ADMIN);
            admin.setStatus(User.Status.ACTIVE);
            admin.setCreatedAt(LocalDateTime.now());
            userRepository.save(admin);
            logger.info("Default admin user seeded successfully.");
        }
    }

    public void sendRegistrationOtp(SendOtpRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new DuplicateResourceException("Email is already registered!");
        }

        // Generate 6-digit OTP
        String otpCode = String.format("%06d", new java.util.Random().nextInt(999999));

        OtpToken otpToken = otpRepository.findByEmail(request.getEmail()).orElse(new OtpToken());
        
        // Simple rate limiting (60 seconds cooldown)
        if (otpToken.getCreatedAt() != null && otpToken.getCreatedAt().plusSeconds(60).isAfter(LocalDateTime.now())) {
            throw new RateLimitExceededException("Please wait before requesting a new OTP.");
        }

        otpToken.setEmail(request.getEmail());
        otpToken.setOtpCode(otpCode);
        otpToken.setExpiryTime(LocalDateTime.now().plusMinutes(otpExpirationMinutes));
        otpToken.setAttempts(0);
        otpToken.setCreatedAt(LocalDateTime.now());

        otpRepository.save(otpToken);

        emailService.sendOtpEmail(request.getEmail(), otpCode);
    }

    public AuthResponse registerUser(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new DuplicateResourceException("Email is already taken!");
        }

        OtpToken otpToken = otpRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("No pending registration found for this email. Please request an OTP."));

        if (otpToken.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new InvalidCredentialsException("OTP has expired. Please request a new one.");
        }

        if (otpToken.getAttempts() >= 5) {
            otpRepository.delete(otpToken);
            throw new InvalidCredentialsException("Too many invalid attempts. Please request a new OTP.");
        }

        if (!otpToken.getOtpCode().equals(request.getOtpCode())) {
            otpToken.setAttempts(otpToken.getAttempts() + 1);
            otpRepository.save(otpToken);
            throw new InvalidCredentialsException("Invalid OTP code.");
        }

        // OTP verified successfully, create user
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole(User.Role.USER);
        user.setStatus(User.Status.ACTIVE);
        user.setCreatedAt(LocalDateTime.now());

        userRepository.save(user);
        otpRepository.delete(otpToken);

        return authenticateAndGenerateToken(request.getEmail(), request.getPassword());
    }

    public AuthResponse registerAdmin(RegisterAdminRequest request, String clientIp) {
        if (!registrationEnabled) {
            throw new FeatureDisabledException("Admin registration is currently disabled");
        }

        if (!rateLimiterService.tryConsume(clientIp)) {
            throw new RateLimitExceededException("Too many registration attempts. Please try again later.");
        }

        if (request.getSecretKey() == null) {
            logger.warn("Failed admin registration attempt from IP: {}", clientIp);
            throw new InvalidCredentialsException("Invalid admin security key");
        }

        boolean keyMatches = MessageDigest.isEqual(
                request.getSecretKey().getBytes(StandardCharsets.UTF_8),
                adminSecretKey.getBytes(StandardCharsets.UTF_8)
        );

        if (!keyMatches) {
            logger.warn("Failed admin registration attempt (invalid key) from IP: {}", clientIp);
            throw new InvalidCredentialsException("Invalid admin security key");
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new DuplicateResourceException("Email is already taken!");
        }

        User admin = new User();
        admin.setName(request.getName());
        admin.setEmail(request.getEmail());
        admin.setPassword(passwordEncoder.encode(request.getPassword()));
        admin.setPhone(request.getPhone());
        admin.setRole(User.Role.ADMIN);
        admin.setStatus(User.Status.ACTIVE);
        admin.setCreatedAt(LocalDateTime.now());

        userRepository.save(admin);

        return authenticateAndGenerateToken(request.getEmail(), request.getPassword());
    }

    @Autowired
    private RefreshTokenService refreshTokenService;

    public AuthResponse login(LoginRequest request) {
        rateLimiterService.checkLoginAllowed(request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    rateLimiterService.recordFailedLogin(request.getEmail());
                    return new InvalidCredentialsException("Invalid email or password");
                });

        boolean matches = passwordEncoder.matches(request.getPassword(), user.getPassword());

        if (!matches) {
            rateLimiterService.recordFailedLogin(request.getEmail());
            throw new InvalidCredentialsException("Invalid email or password");
        }
        
        if (user.getStatus() != User.Status.ACTIVE) {
            rateLimiterService.recordFailedLogin(request.getEmail());
            throw new InvalidCredentialsException("Invalid email or password");
        }

        rateLimiterService.resetLoginAttempts(request.getEmail());

        UserDetailsImpl userDetails = new UserDetailsImpl(user);
        
        if (request.isAdminPortal()) {
            if (userDetails.getUser().getRole() != User.Role.ADMIN) {
                throw new RuntimeException("Only administrators can log in here.");
            }
        } else {
            if (userDetails.getUser().getRole() == User.Role.ADMIN) {
                throw new RuntimeException("Admin accounts must log in through the Administrator Portal.");
            }
        }

        String token = jwtUtil.generateToken(userDetails);
        String refreshToken = refreshTokenService.createRefreshToken(userDetails.getUser().getId()).getToken();
        
        return new AuthResponse(token, refreshToken, AuthResponse.UserDto.fromUser(userDetails.getUser()));
    }

    private AuthResponse authenticateAndGenerateToken(String email, String password) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
        );

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String token = jwtUtil.generateToken(userDetails);
        String refreshToken = refreshTokenService.createRefreshToken(userDetails.getUser().getId()).getToken();

        return new AuthResponse(token, refreshToken, AuthResponse.UserDto.fromUser(userDetails.getUser()));
    }
}

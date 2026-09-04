# Security Notes & Hardening Guidelines

This document tracks the implemented security mechanisms and operational guidelines for the Library Management System.

## Applied Defenses

### OTP & Authentication Security
- **Rate Limiting**: 
  - 60-second cooldown per email for new OTP requests.
  - IP-based limit of 3 requests per 15 minutes for OTP endpoints.
  - Daily cap of 5 OTP sends per 24 hours per target email.
- **Enumeration Prevention**: All OTP generation endpoints (`/api/auth/send-otp`, `/api/auth/forgot-password-otp`) are protected against email enumeration via unified success responses and `@Async` email dispatch to prevent timing attacks.
- **Cryptographic Generation**: OTPs are generated using `java.security.SecureRandom`.
- **Constant-Time Verification**: OTP validation utilizes `MessageDigest.isEqual()` to mitigate timing side-channels during verification.
- **Max Attempts**: OTPs are strictly limited to 5 invalid attempts before permanent revocation.

### Database Defenses
- **ReDoS Prevention**: All user-supplied search parameters used in MongoDB `$regex` queries (e.g., `BookService`) are safely escaped using `Pattern.quote()` and strictly length-bounded to prevent backtracking Denial of Service (DoS) attacks.

## Operational Deployment Notes

### Proxy Header Trust
The application property `app.admin.trust-proxy-headers` dictates whether the application trusts the `X-Forwarded-For` header for IP-based rate limiting.
- **Default**: `false`
- **When to enable**: Set this to `true` ONLY if the application is running behind a trusted reverse proxy or load balancer (e.g., AWS ALB, Nginx, Cloudflare) that is explicitly configured to strip incoming client headers and accurately inject the true client IP. Enabling this while directly exposed to the internet will trivially bypass all IP rate limits.

### Memory Management
The `RateLimiterService` relies on in-memory `ConcurrentHashMap`s. To prevent Out of Memory (OOM) errors during volumetric attacks, an hourly scheduled task prunes stale entries. Ensure `@EnableScheduling` remains active on the main application class.

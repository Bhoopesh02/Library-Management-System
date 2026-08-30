# Security Notes

This document highlights important security considerations and architectural tradeoffs made in the Library Management System.

## Token Blocklist

The access token blocklist (implemented in `TokenBlocklistService`) is currently **in-memory and instance-local** (using a `ConcurrentHashMap` with scheduled cleanup).

### Important Limitation
This approach will **NOT** work correctly if the application is ever deployed across multiple instances/pods behind a load balancer. A token that is blocklisted (e.g., via logout) on Instance A will remain completely valid and accepted on Instance B.

### Future Migration
If horizontal scaling is ever required, this blocklist must be migrated to a shared store. Recommended approaches:
- **Redis**: Use Redis to store the blocklisted tokens with a TTL matching the token's remaining lifespan.
- **MongoDB**: Store blocklisted tokens in a dedicated MongoDB collection and use a TTL index (similar to how `RefreshToken` is implemented) to automatically clean up expired tokens.

## Account-Based Rate Limiting (Exponential Backoff)

The failed login attempt tracker (implemented in `RateLimiterService` for exponential backoff) is also **in-memory and instance-local**, sharing the exact same limitation as the token blocklist. If deployed across multiple instances, an attacker could rotate requests through different load-balanced pods to bypass or reset the backoff delays. This should also be migrated to a shared store (like Redis) if horizontally scaled.

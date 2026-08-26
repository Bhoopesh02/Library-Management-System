package com.library.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configure(http))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                // Allow public access to uploaded files (like book covers)
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/books/*/coverImage").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/uploads/**").permitAll() // Keeping just in case for older data or other static assets
                .requestMatchers("/api/dashboard/admin", "/api/dashboard/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/users/**").hasRole("ADMIN") // Only admin can manage users
                // Allow users to GET books, but only admin can modify
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/books/**").hasAnyRole("ADMIN", "USER")
                .requestMatchers("/api/books/**").hasRole("ADMIN")
                // Transactions
                .requestMatchers("/api/transactions/issue", "/api/transactions/return").hasRole("ADMIN")
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/transactions").hasRole("ADMIN")
                .requestMatchers("/api/transactions/user/**").hasAnyRole("ADMIN", "USER")
                // Fines
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/fines").hasRole("ADMIN")
                .requestMatchers("/api/fines/user/**").hasAnyRole("ADMIN", "USER")
                .requestMatchers("/api/fines/*/pay").hasRole("ADMIN")
                .anyRequest().authenticated()
            );
            
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

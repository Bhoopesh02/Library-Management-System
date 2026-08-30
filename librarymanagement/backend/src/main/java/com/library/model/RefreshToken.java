package com.library.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "refresh_tokens")
public class RefreshToken {

    @Id
    private String id;

    @Indexed(unique = true)
    private String token;

    private String userId;

    // MongoDB TTL Index: Document expires 0 seconds after the expiryDate timestamp.
    @Indexed(expireAfterSeconds = 0)
    private Date expiryDate;

    // Constructors, Getters, Setters
    public RefreshToken() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Date getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(Date expiryDate) {
        this.expiryDate = expiryDate;
    }
}

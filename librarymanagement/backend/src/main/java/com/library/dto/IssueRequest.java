package com.library.dto;

import jakarta.validation.constraints.NotBlank;

public class IssueRequest {
    @NotBlank(message = "User ID is required")
    private String userId;

    @NotBlank(message = "Book ID is required")
    private String bookId;

    public IssueRequest() {}

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getBookId() { return bookId; }
    public void setBookId(String bookId) { this.bookId = bookId; }
}

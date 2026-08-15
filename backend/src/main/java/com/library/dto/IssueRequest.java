package com.library.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class IssueRequest {
    @NotBlank(message = "User ID is required")
    private String userId;

    @NotBlank(message = "Book ID is required")
    private String bookId;

    @NotNull(message = "Due Date is required")
    private LocalDate dueDate;

    public IssueRequest() {}

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getBookId() { return bookId; }
    public void setBookId(String bookId) { this.bookId = bookId; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
}

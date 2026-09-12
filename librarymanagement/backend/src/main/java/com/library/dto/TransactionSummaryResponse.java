package com.library.dto;

public class TransactionSummaryResponse {
    private long currentlyBorrowed;
    private long dueSoon;

    public TransactionSummaryResponse() {}

    public TransactionSummaryResponse(long currentlyBorrowed, long dueSoon) {
        this.currentlyBorrowed = currentlyBorrowed;
        this.dueSoon = dueSoon;
    }

    public long getCurrentlyBorrowed() {
        return currentlyBorrowed;
    }

    public void setCurrentlyBorrowed(long currentlyBorrowed) {
        this.currentlyBorrowed = currentlyBorrowed;
    }

    public long getDueSoon() {
        return dueSoon;
    }

    public void setDueSoon(long dueSoon) {
        this.dueSoon = dueSoon;
    }
}

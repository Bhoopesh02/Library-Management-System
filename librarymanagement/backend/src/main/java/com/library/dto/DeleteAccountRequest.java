package com.library.dto;

import jakarta.validation.constraints.NotBlank;

public class DeleteAccountRequest {

    @NotBlank(message = "Admin delete key is required")
    private String deleteKey;

    public DeleteAccountRequest() {}

    public DeleteAccountRequest(String deleteKey) {
        this.deleteKey = deleteKey;
    }

    public String getDeleteKey() {
        return deleteKey;
    }

    public void setDeleteKey(String deleteKey) {
        this.deleteKey = deleteKey;
    }

    @Override
    public String toString() {
        return "DeleteAccountRequest{deleteKey='[PROTECTED]'}";
    }
}

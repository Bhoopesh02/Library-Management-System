package com.library.dto;

import jakarta.validation.constraints.NotBlank;

public class DeleteAccountRequest {

    @NotBlank(message = "Admin master key is required")
    private String masterKey;

    public DeleteAccountRequest() {}

    public DeleteAccountRequest(String masterKey) {
        this.masterKey = masterKey;
    }

    public String getMasterKey() {
        return masterKey;
    }

    public void setMasterKey(String masterKey) {
        this.masterKey = masterKey;
    }

    @Override
    public String toString() {
        return "DeleteAccountRequest{masterKey='[PROTECTED]'}";
    }
}

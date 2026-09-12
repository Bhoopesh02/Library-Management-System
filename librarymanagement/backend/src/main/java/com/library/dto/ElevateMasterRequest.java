package com.library.dto;

import jakarta.validation.constraints.NotBlank;

public class ElevateMasterRequest {

    @NotBlank(message = "Admin master key is required")
    private String masterKey;

    public ElevateMasterRequest() {}

    public ElevateMasterRequest(String masterKey) {
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
        return "ElevateMasterRequest{masterKey='[PROTECTED]'}";
    }
}

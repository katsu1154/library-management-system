package com.library.dto;

import jakarta.validation.constraints.NotBlank;

public class SocialLoginRequest {
    @NotBlank
    private String provider;

    @NotBlank
    private String token;

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
}

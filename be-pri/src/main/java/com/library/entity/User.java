package com.library.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "email"),
        @UniqueConstraint(columnNames = "identityNumber")
})
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(length = 100, nullable = false)
    private String email;

    @JsonIgnore
    @Column(length = 120)
    private String password;

    @Column(length = 100)
    private String fullName;

    @Column(length = 20)
    private String phoneNumber;

    @Column(length = 20)
    private String identityNumber;

    @Column(length = 500)
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private AuthProvider provider;

    private boolean enabled = true;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private RoleType role;

    public User() {}

    public User(String email, String password, String fullName, String phoneNumber, String identityNumber, String avatarUrl, AuthProvider provider, boolean enabled, RoleType role) {
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.identityNumber = identityNumber;
        this.avatarUrl = avatarUrl;
        this.provider = provider;
        this.enabled = enabled;
        this.role = role;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getIdentityNumber() { return identityNumber; }
    public void setIdentityNumber(String identityNumber) { this.identityNumber = identityNumber; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public AuthProvider getProvider() { return provider; }
    public void setProvider(AuthProvider provider) { this.provider = provider; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public RoleType getRole() { return role; }
    public void setRole(RoleType role) { this.role = role; }

    @com.fasterxml.jackson.annotation.JsonProperty("roleName")
    public String getRoleName() {
        return role != null ? role.name() : null;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("accountId")
    public Long getAccountId() {
        return id;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("status")
    public String getStatus() {
        return enabled ? "ACTIVE" : "LOCKED";
    }
}

package com.library.dto;
import com.library.entity.RoleType;
import jakarta.validation.constraints.Email;
public class AdminUpdateUserRequest {
    @Email
    private String email;
    
    private String password;
    private String fullName;
    private String phoneNumber;
    private String identityNumber;
    private RoleType role;

    public AdminUpdateUserRequest() {}

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
    public RoleType getRole() { return role; }
    public void setRole(RoleType role) { this.role = role; }
}

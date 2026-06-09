package com.library.dto;

import jakarta.validation.constraints.NotBlank;

public class PublisherRequest {
    @NotBlank
    private String name;
    private String address;
    private String contactInfo;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getContactInfo() { return contactInfo; }
    public void setContactInfo(String contactInfo) { this.contactInfo = contactInfo; }
}

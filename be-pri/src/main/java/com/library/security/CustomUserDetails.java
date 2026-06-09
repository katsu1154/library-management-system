package com.library.security;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.library.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;

public class CustomUserDetails implements UserDetails, OAuth2User {
    private Long id;
    private String email;
    private String fullName;
    private String avatarUrl;

    @JsonIgnore
    private String password;

    private Collection<? extends GrantedAuthority> authorities;
    private Map<String, Object> attributes;
    private boolean enabled;

    public CustomUserDetails(Long id, String email, String fullName, String avatarUrl, String password, Collection<? extends GrantedAuthority> authorities, Map<String, Object> attributes, boolean enabled) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.avatarUrl = avatarUrl;
        this.password = password;
        this.authorities = authorities;
        this.attributes = attributes;
        this.enabled = enabled;
    }

    public static CustomUserDetails build(User user) {
        GrantedAuthority authority = new SimpleGrantedAuthority(user.getRole().name());

        return new CustomUserDetails(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getAvatarUrl(),
                user.getPassword(),
                Collections.singletonList(authority),
                null,
                user.isEnabled()
        );
    }

    public static CustomUserDetails build(User user, Map<String, Object> attributes) {
        CustomUserDetails userDetails = CustomUserDetails.build(user);
        userDetails.setAttributes(attributes);
        return userDetails;
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getFullName() { return fullName; }
    public String getAvatarUrl() { return avatarUrl; }

    public void setAttributes(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email; // Spring Security requires getUsername, we return email
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    @Override
    public String getName() {
        return String.valueOf(id);
    }
}

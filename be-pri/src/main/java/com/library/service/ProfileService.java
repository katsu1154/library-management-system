package com.library.service;

import com.library.entity.User;
import com.library.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class ProfileService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public User getMyProfile(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Error: User not found!"));
    }

    @Transactional
    public User updateMyProfile(Long userId, String fullName, String phoneNumber, String identityNumber, MultipartFile avatar) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Error: User not found!"));

        if (fullName != null && !fullName.trim().isEmpty()) {
            user.setFullName(fullName);
        }

        if (phoneNumber != null) {
            user.setPhoneNumber(phoneNumber);
        }

        if (identityNumber != null && !identityNumber.trim().isEmpty()) {
            if (!identityNumber.equals(user.getIdentityNumber()) && userRepository.existsByIdentityNumber(identityNumber)) {
                throw new RuntimeException("Error: Identity Number is already in use!");
            }
            user.setIdentityNumber(identityNumber);
        }

        if (avatar != null && !avatar.isEmpty()) {
            String avatarUrl = cloudinaryService.uploadImage(avatar);
            user.setAvatarUrl(avatarUrl);
        }

        return userRepository.save(user);
    }

    @Transactional
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Error: User not found!"));
        
        if (user.getProvider() != null && user.getProvider() != com.library.entity.AuthProvider.LOCAL) {
            throw new RuntimeException("Tài khoản đăng nhập qua mạng xã hội không thể đổi mật khẩu.");
        }

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Mật khẩu cũ không chính xác.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}

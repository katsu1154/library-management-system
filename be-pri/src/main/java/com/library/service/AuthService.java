package com.library.service;

import com.library.dto.AdminCreateUserRequest;
import com.library.dto.AdminUpdateUserRequest;
import com.library.dto.RegisterRequest;
import com.library.entity.AuthProvider;
import com.library.entity.PasswordResetToken;
import com.library.entity.RoleType;
import com.library.entity.User;
import com.library.repository.PasswordResetTokenRepository;
import com.library.repository.UserRepository;
import com.library.repository.WalletRepository;
import com.library.entity.Wallet;
import com.library.entity.OtpToken;
import com.library.repository.OtpTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.Map;
import org.springframework.web.client.RestTemplate;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private CloudinaryService cloudinaryService;
    
    @Autowired
    private PasswordResetTokenRepository tokenRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private OtpTokenRepository otpTokenRepository;

    private String generateOtpCode() {
        int otp = 100000 + new java.util.Random().nextInt(900000);
        return String.valueOf(otp);
    }

    @Transactional
    public User registerUser(RegisterRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }
        
        if (signUpRequest.getIdentityNumber() != null && !signUpRequest.getIdentityNumber().isEmpty() 
            && userRepository.existsByIdentityNumber(signUpRequest.getIdentityNumber())) {
            throw new RuntimeException("Error: Identity Number is already in use!");
        }

        User user = new User();
        user.setEmail(signUpRequest.getEmail());
        user.setFullName(signUpRequest.getFullName());
        user.setPhoneNumber(signUpRequest.getPhoneNumber());
        user.setIdentityNumber(signUpRequest.getIdentityNumber());
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        user.setProvider(AuthProvider.LOCAL);
        user.setRole(RoleType.ROLE_EXTERNAL_READER);
        user.setEnabled(false); // Account inactive until OTP verification
        
        user = userRepository.save(user);
        walletRepository.save(new Wallet(user));

        // Sinh OTP
        String otpCode = generateOtpCode();
        OtpToken otpToken = new OtpToken(otpCode, user, LocalDateTime.now().plusMinutes(5));
        otpTokenRepository.save(otpToken);
        
        // Gửi mail OTP
        try {
            emailService.sendOtpVerification(user.getEmail(), otpCode);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Lỗi gửi Email OTP: Vui lòng kiểm tra lại cấu hình Mật khẩu ứng dụng (App Password) của Gmail trong application.yml!");
        }
        
        return user;
    }
    
    @Transactional
    public User createUserByAdmin(AdminCreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        if (request.getIdentityNumber() != null && !request.getIdentityNumber().isEmpty() 
            && userRepository.existsByIdentityNumber(request.getIdentityNumber())) {
            throw new RuntimeException("Error: Identity Number is already in use!");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setIdentityNumber(request.getIdentityNumber());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setProvider(AuthProvider.LOCAL);
        user.setRole(request.getRole());
        
        user = userRepository.save(user);
        if (user.getRole() == RoleType.ROLE_EXTERNAL_READER || user.getRole() == RoleType.ROLE_INTERNAL_READER) {
            walletRepository.save(new Wallet(user));
        }
        return user;
    }

    @Transactional
    public void generatePasswordResetToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email"));

        tokenRepository.deleteByUser(user);

        String token = generateOtpCode();
        PasswordResetToken resetToken = new PasswordResetToken(token, user, LocalDateTime.now().plusHours(1));
        tokenRepository.save(resetToken);

        emailService.sendPasswordResetToken(user.getEmail(), token);
    }

    @Transactional
    public void resetPassword(String email, String otpCode, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email"));

        PasswordResetToken resetToken = tokenRepository.findByToken(otpCode)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (!resetToken.getUser().getId().equals(user.getId())) {
             throw new RuntimeException("Invalid token for this email");
        }

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token has expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        tokenRepository.delete(resetToken);
    }

    @Transactional
    public void verifyAccount(String email, String otpCode) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Error: User not found"));

        if (user.isEnabled()) {
            throw new RuntimeException("Error: Account is already verified");
        }

        OtpToken otpToken = otpTokenRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Error: No OTP found for this user"));

        if (!otpToken.getOtpCode().equals(otpCode)) {
            throw new RuntimeException("Error: Invalid OTP code");
        }

        if (otpToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Error: OTP has expired");
        }

        user.setEnabled(true);
        userRepository.save(user);
        otpTokenRepository.delete(otpToken);
    }

    @Transactional
    public User updateUserByAdmin(Long userId, AdminUpdateUserRequest request, MultipartFile avatar) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Error: User not found!"));

        if (request.getFullName() != null && !request.getFullName().isEmpty()) {
            user.setFullName(request.getFullName());
        }

        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }

        if (request.getIdentityNumber() != null && !request.getIdentityNumber().isEmpty()) {
            if (!request.getIdentityNumber().equals(user.getIdentityNumber()) && userRepository.existsByIdentityNumber(request.getIdentityNumber())) {
                throw new RuntimeException("Error: Identity Number is already in use!");
            }
            user.setIdentityNumber(request.getIdentityNumber());
        }

        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Error: Email is already in use!");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }

        if (avatar != null && !avatar.isEmpty()) {
            String avatarUrl = cloudinaryService.uploadImage(avatar);
            user.setAvatarUrl(avatarUrl);
        }

        return userRepository.save(user);
    }

    @Transactional
    public User toggleUserBanStatus(Long userId, boolean isBanned) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Error: User not found!"));
        
        user.setEnabled(!isBanned);
        return userRepository.save(user);
    }

    @Transactional
    public User processSocialLogin(String provider, String token) {
        String email = null;
        String name = null;
        String picture = null;
        RestTemplate restTemplate = new RestTemplate();

        if ("GOOGLE".equalsIgnoreCase(provider)) {
            String url = "https://www.googleapis.com/oauth2/v3/userinfo";
            try {
                org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
                headers.set("Authorization", "Bearer " + token);
                org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);
                org.springframework.http.ResponseEntity<Map> response = restTemplate.exchange(url, org.springframework.http.HttpMethod.GET, entity, Map.class);
                Map body = response.getBody();
                if (body != null) {
                    email = (String) body.get("email");
                    name = (String) body.get("name");
                    picture = (String) body.get("picture");
                }
            } catch (Exception e) {
                throw new RuntimeException("Lỗi xác thực Google Token: " + e.getMessage());
            }
        } else if ("OFFICE365".equalsIgnoreCase(provider)) {
            String url = "https://graph.microsoft.com/v1.0/me";
            try {
                org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
                headers.set("Authorization", "Bearer " + token);
                org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);
                org.springframework.http.ResponseEntity<Map> response = restTemplate.exchange(url, org.springframework.http.HttpMethod.GET, entity, Map.class);
                Map body = response.getBody();
                if (body != null) {
                    email = (String) body.get("userPrincipalName");
                    if (email == null) email = (String) body.get("mail");
                    name = (String) body.get("displayName");
                }
            } catch (Exception e) {
                throw new RuntimeException("Lỗi xác thực Microsoft Token: " + e.getMessage());
            }
        } else {
            throw new RuntimeException("Provider không hợp lệ!");
        }

        if (email == null || email.isEmpty()) {
            throw new RuntimeException("Không thể lấy email từ tài khoản mạng xã hội!");
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = new User();
            user.setEmail(email);
            user.setFullName(name != null ? name : "Người dùng");
            user.setAvatarUrl(picture);
            user.setProvider(AuthProvider.valueOf(provider.toUpperCase()));
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            
            String lowerEmail = email.toLowerCase();
            if (lowerEmail.endsWith("@thanglong.edu.vn") || lowerEmail.endsWith("@e.tlu.edu.vn")) {
                user.setRole(RoleType.ROLE_INTERNAL_READER);
            } else {
                user.setRole(RoleType.ROLE_EXTERNAL_READER);
            }
            user.setEnabled(true);
            user = userRepository.save(user);
            walletRepository.save(new Wallet(user));
        } else {
            if (user.getProvider() == AuthProvider.LOCAL) {
                user.setProvider(AuthProvider.valueOf(provider.toUpperCase()));
                userRepository.save(user);
            }
        }
        return user;
    }
}

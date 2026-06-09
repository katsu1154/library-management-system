package com.library.repository;

import com.library.entity.OtpToken;
import com.library.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {
    Optional<OtpToken> findByOtpCode(String otpCode);
    Optional<OtpToken> findByUser(User user);
    void deleteByUser(User user);
}

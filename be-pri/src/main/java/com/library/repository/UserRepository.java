package com.library.repository;

import com.library.entity.RoleType;
import com.library.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhoneNumber(String phoneNumber);
    boolean existsByEmail(String email);
    boolean existsByIdentityNumber(String identityNumber);
    List<User> findByRole(RoleType role);
    List<User> findByRoleIn(List<RoleType> roles);
    List<User> findByRoleNotIn(List<RoleType> roles);
    long countByRoleIn(List<RoleType> roles);
}

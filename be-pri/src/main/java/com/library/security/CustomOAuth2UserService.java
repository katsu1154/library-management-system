package com.library.security;

import com.library.entity.AuthProvider;
import com.library.entity.RoleType;
import com.library.entity.User;
import com.library.repository.UserRepository;
import com.library.repository.WalletRepository;
import com.library.entity.Wallet;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        try {
            return processOAuth2User(userRequest, oAuth2User);
        } catch (Exception ex) {
            throw new OAuth2AuthenticationException(ex.getMessage());
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest oAuth2UserRequest, OAuth2User oAuth2User) {
        String registrationId = oAuth2UserRequest.getClientRegistration().getRegistrationId();
        
        String email = oAuth2User.getAttribute("email");
        if (email == null) {
            throw new OAuth2AuthenticationException("Email not found from OAuth2 provider");
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            if (!user.getProvider().name().equalsIgnoreCase(registrationId)) {
                user.setProvider(AuthProvider.valueOf(registrationId.toUpperCase()));
                user = userRepository.save(user);
            }
        } else {
            user = registerNewOAuth2User(oAuth2UserRequest, oAuth2User, email);
        }

        return CustomUserDetails.build(user, oAuth2User.getAttributes());
    }

    private User registerNewOAuth2User(OAuth2UserRequest oAuth2UserRequest, OAuth2User oAuth2User, String email) {
        User user = new User();
        String provider = oAuth2UserRequest.getClientRegistration().getRegistrationId();
        
        String name = oAuth2User.getAttribute("name");
        
        String picture = oAuth2User.getAttribute("picture");
        
        user.setProvider(AuthProvider.valueOf(provider.toUpperCase()));
        user.setFullName(name != null ? name : email.split("@")[0]);
        user.setAvatarUrl(picture);
        user.setEmail(email);
        user.setEnabled(true);
        
        if (email != null && (email.toLowerCase().endsWith("@thanglong.edu.vn") || email.toLowerCase().endsWith("@e.tlu.edu.vn"))) {
            user.setRole(RoleType.ROLE_INTERNAL_READER);
        } else {
            user.setRole(RoleType.ROLE_EXTERNAL_READER);
        }
        
        user = userRepository.save(user);
        
        if (user.getRole() == RoleType.ROLE_EXTERNAL_READER || user.getRole() == RoleType.ROLE_INTERNAL_READER) {
            walletRepository.save(new Wallet(user));
        }
        
        return user;
    }
}

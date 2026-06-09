package com.library.config;

import com.library.security.AuthEntryPointJwt;
import com.library.security.AuthTokenFilter;
import com.library.security.CustomOAuth2UserService;
import com.library.security.CustomUserDetailsService;
import com.library.security.OAuth2LoginSuccessHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    CustomUserDetailsService userDetailsService;

    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;

    @Autowired
    private CustomOAuth2UserService customOAuth2UserService;

    @Autowired
    private OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();

        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());

        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(org.springframework.security.config.Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
        .requestMatchers("/api/auth/**").permitAll()
        .requestMatchers("/api/vnpay/return").permitAll()
        .requestMatchers("/oauth2/**").permitAll()
        .requestMatchers("/login/**").permitAll()
        .requestMatchers("/ws/**").permitAll()
        .requestMatchers("/error").permitAll()
        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/books", "/api/books/**").permitAll()
        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/categories", "/api/categories/**").permitAll()
        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/authors", "/api/authors/**").permitAll()
        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/publishers", "/api/publishers/**").permitAll()
        
        // ==========================================
        // THÊM MỚI 4 DÒNG NÀY ĐỂ CẤP QUYỀN
        // ==========================================
        // 1. Kế toán được xem thu phạt
        .requestMatchers("/api/violations", "/api/violations/**").authenticated()
.requestMatchers("/api/borrow", "/api/borrow/**").authenticated()
.requestMatchers("/api/book-copies", "/api/book-copies/**").authenticated()
        // 3. Cho phép tất cả nhân viên đã đăng nhập được xem Dashboard
        .requestMatchers("/api/stats/dashboard").authenticated()
        // ==========================================

        .requestMatchers("/api/admin/**").hasRole("ADMIN")
        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2UserService)
                        )
                        .successHandler(oAuth2LoginSuccessHandler)
                );

        http.authenticationProvider(authenticationProvider());

        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

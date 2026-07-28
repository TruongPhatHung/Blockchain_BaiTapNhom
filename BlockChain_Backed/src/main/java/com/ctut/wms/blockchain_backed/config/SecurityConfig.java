package com.ctut.wms.blockchain_backed.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // ĐÃ SỬA: Cho phép CORS hoạt động bình thường để Frontend kết nối không bị chặn
                .cors(cors -> {})
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Cho phép hiển thị ảnh và các API công khai
                        .requestMatchers("/api/auth/**", "/api/accounts/register", "/api/transactions/**", "/uploads/**").permitAll()

                        .requestMatchers("/api/admin/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/staff/**", "/api/support/**").hasAnyRole("STAFF", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/users/*/settings").permitAll()

                        .requestMatchers("/api/upload/**", "/api/upload").permitAll()

                        // API xác thực Web3 được mở hoàn toàn công khai
                        .requestMatchers("/api/transactions/verify-onchain/**").permitAll()

                        .requestMatchers("/api/users/**").hasAnyAuthority("USER", "STAFF", "ADMIN")
                        .requestMatchers(
                                "/api/user/**",
                                "/api/statistics/**",
                                "/api/notifications/**",
                                "/api/beneficiaries/**"
                        ).hasAnyRole("USER", "STAFF", "ADMIN")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
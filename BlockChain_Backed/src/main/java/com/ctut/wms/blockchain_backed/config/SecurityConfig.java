package com.ctut.wms.blockchain_backed.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // 1. Cấu hình công cụ mã hóa mật khẩu (BCrypt)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 2. Cấu hình quản lý xác thực (Dùng để gọi hàm Login sau này)
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    // 3. Cấu hình bộ lọc bảo mật chính (Phân quyền và Rules)
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Cho phép tất cả mọi người truy cập API auth (Đăng nhập, Đăng ký)
                        .requestMatchers("/api/auth/**", "/api/accounts/register").permitAll()

                        // Chỉ ADMIN mới được truy cập các API bắt đầu bằng /api/admin/
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // Cả STAFF và ADMIN đều có thể truy cập API của nhân viên
                        .requestMatchers("/api/staff/**", "/api/support/**").hasAnyRole("STAFF", "ADMIN")
                        .requestMatchers("/api/users/**")
                        .hasAnyRole("USER", "STAFF", "ADMIN")
                        // Khách hàng (USER) và cả hệ thống đều có thể dùng các API chung
                        // BỔ SUNG: Thêm các endpoint mới cho thông báo, user, danh bạ
                        .requestMatchers(
                                "/api/user/**",
                                "/api/transactions/**",
                                "/api/statistics/**",
                                "/api/notifications/**",
                                "/api/users/**",
                                "/api/beneficiaries/**"
                        ).hasAnyRole("USER", "STAFF", "ADMIN")

                        // Bất kỳ Request nào khác ngoài các mục trên đều bắt buộc phải đăng nhập
                        .anyRequest().authenticated()
                );

        return http.build();
    }

    // 4. Cấu hình CORS để cho phép ReactJS gọi API
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
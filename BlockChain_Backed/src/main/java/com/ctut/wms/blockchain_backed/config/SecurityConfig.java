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
                // Kích hoạt cấu hình CORS bên dưới
                //.cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // Tắt CSRF vì chúng ta dùng API (JWT Token) thay vì Session Cookie
                .csrf(csrf -> csrf.disable())
                // Cấu hình không lưu Session (Stateless) phù hợp với REST API
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Cấu hình phân quyền cho từng đường dẫn API
                .authorizeHttpRequests(auth -> auth
                        // Cho phép tất cả mọi người truy cập API auth (Đăng nhập, Đăng ký)
                        .requestMatchers("/api/auth/**").permitAll().requestMatchers("/api/auth/**", "/api/accounts/register").permitAll()

//                        // Chỉ ADMIN mới được truy cập các API bắt đầu bằng /api/admin/
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
//
//                        // Cả STAFF và ADMIN đều có thể truy cập API của nhân viên
//                        .requestMatchers("/api/staff/**").hasAnyRole("STAFF", "ADMIN")
//
//                        // Khách hàng (USER) và cả hệ thống đều có thể dùng các API chung
//                        .requestMatchers("/api/user/**").hasAnyRole("USER", "STAFF", "ADMIN")
                                .requestMatchers("/api/auth/**", "/api/accounts/register").permitAll()

                        // Bất kỳ Request nào khác ngoài các mục trên đều bắt buộc phải đăng nhập
                        .anyRequest().authenticated()
                );

        // Nơi đây sau này chúng ta sẽ chèn thêm bộ lọc (Filter) để kiểm tra JWT Token
        // http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // 4. Cấu hình CORS để cho phép ReactJS gọi API
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Thay đổi port 5173 thành port thực tế nếu React của bạn chạy port khác
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Áp dụng cho mọi API
        return source;
    }
}
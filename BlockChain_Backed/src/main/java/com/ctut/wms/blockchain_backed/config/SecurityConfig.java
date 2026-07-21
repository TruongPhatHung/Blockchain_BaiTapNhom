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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // Inject JWT filter để xử lý token trong mỗi request
    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    // Mã hóa password bằng BCrypt
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Cung cấp AuthenticationManager cho quá trình xác thực
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    // Cấu hình bảo mật chính
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Cấu hình CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Tắt CSRF (dùng JWT nên không cần)
                .csrf(csrf -> csrf.disable())

                // Không sử dụng session (stateless)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Phân quyền API
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/api/auth/**", "/api/accounts/register").permitAll()

                        // Admin only
                        .requestMatchers("/api/admin/**").hasAuthority("ADMIN")

                        // Staff & Admin
                        .requestMatchers("/api/staff/**", "/api/support/**").hasAnyRole("STAFF", "ADMIN")

                        // User settings
                        .requestMatchers(HttpMethod.PUT, "/api/users/*/settings").permitAll()

                        // Users (⚠ currently permitAll trước -> rule dưới sẽ không chạy)
                        .requestMatchers("/api/users/**").permitAll()
                        .requestMatchers("/api/users/**").hasAnyAuthority("USER", "STAFF", "ADMIN")

                        // Transactions (public)
                        .requestMatchers("/api/transactions/**").permitAll()

                        // Các API yêu cầu đăng nhập
                        .requestMatchers(
                                "/api/user/**",
                                "/api/statistics/**",
                                "/api/notifications/**",
                                "/api/beneficiaries/**"
                        ).hasAnyRole("USER", "STAFF", "ADMIN")

                        // Các request còn lại phải xác thực
                        .anyRequest().authenticated()
                )

                // Thêm JWT filter trước UsernamePasswordAuthenticationFilter
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // Cấu hình CORS cho frontend (Vite chạy port 5173)
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
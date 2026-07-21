package com.ctut.wms.blockchain_backed.config;


import com.ctut.wms.blockchain_backed.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Lấy chuỗi Authorization từ Header gửi lên
        final String authHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;
        String role = null;

        // 2. Kiểm tra xem Header có chứa Token "Bearer ..." hay không
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7); // Cắt bỏ chữ "Bearer " để lấy Token tinh khiết
            try {
                username = jwtUtil.extractUsername(jwt);
                role = jwtUtil.extractRole(jwt);
            } catch (Exception e) {
                logger.error("Token không hợp lệ hoặc đã hết hạn: " + e.getMessage());
            }
        }

        // 3. Nếu lấy được thông tin và hệ thống chưa được cấp quyền truy cập
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            if (!jwtUtil.isTokenExpired(jwt)) {

                // Cấp quyền dựa trên Role lấy ra từ Token
                SimpleGrantedAuthority authority = new SimpleGrantedAuthority(role);

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        username, null, Collections.singletonList(authority)
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Lưu quyền vào Context -> Spring Security xác nhận thành công!
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // Cho phép Request đi tiếp
        filterChain.doFilter(request, response);
    }
}
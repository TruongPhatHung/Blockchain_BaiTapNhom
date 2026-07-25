package com.ctut.wms.blockchain_backed.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class GlobalCorsConfig {

    @Bean
    public FilterRegistrationBean<CorsFilter> corsFilterRegistrationBean() {
        CorsConfiguration config = new CorsConfiguration();

        // 1. Cho phép đính kèm thông tin xác thực (Token/Cookie)
        config.setAllowCredentials(true);

        // 2. Chỉ định chính xác nguồn của ReactJS
        config.addAllowedOrigin("http://localhost:5173");

        // 3. Mở cửa cho TẤT CẢ các Header và Method
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");

        // 4. Áp dụng cho toàn bộ dự án
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        // 5. ĐÓNG GÓI VÀ ÉP BUỘC MỨC ƯU TIÊN CAO NHẤT
        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter(source));
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE); // Quan trọng nhất: Ép chạy đầu tiên!

        return bean;
    }
}
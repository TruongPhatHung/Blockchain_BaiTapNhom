package com.ctut.wms.blockchain_backed.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Ánh xạ đường dẫn web /uploads/** vào thư mục thật ngoài ổ cứng
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}
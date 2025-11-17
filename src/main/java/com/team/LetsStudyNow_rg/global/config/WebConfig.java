package com.team.LetsStudyNow_rg.global.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // 우리 API의 모든 경로("/")에 대해
                .allowedOrigins("http://localhost:3000") // 리액트 앱의 주소(http://localhost:3000)를 허용
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS") // 허용할 HTTP 메서드
                .allowedHeaders("*") // 모든 헤더 허용
                .allowCredentials(true); // 자격 증명(쿠키 등) 허용
    }
}
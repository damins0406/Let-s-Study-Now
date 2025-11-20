package com.team.LetsStudyNow_rg.global.jwt;

import com.team.LetsStudyNow_rg.global.auth.CustomUser;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;

// jwt 필터. 요청마다 1회 실행
@Component
public class JwtFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        Cookie[] cookies = request.getCookies();
        if(cookies == null){
            filterChain.doFilter(request, response);
            return;
        }
        var jwtCookies = "";
        for(int i=0; i<cookies.length; i++){
            if(cookies[i].getName().equals("jwt")){
                jwtCookies = cookies[i].getValue();
            }
        }
        if(jwtCookies.isEmpty()){
            filterChain.doFilter(request, response);
            return;
        }

        // 쿠키에 있는 jwt 확인
        Claims claims;
        try{
            claims = JwtUtil.extractToken(jwtCookies);
        }
        catch (Exception e){
            filterChain.doFilter(request, response);
            return;
        }

        var arr = claims.get("authorities").toString().split(",");
        var authorities = Arrays.stream(arr).map(a -> new SimpleGrantedAuthority(a)).toList();

        // CustomUser에 저장
        CustomUser customUser = new CustomUser(
                claims.get("email").toString(),
                "none",
                authorities
        );
        customUser.username = claims.get("username").toString();
        customUser.email = claims.get("email").toString();

        Number n = claims.get("id", Number.class);
        if (n != null) customUser.id = n.longValue();

        var authToken = new UsernamePasswordAuthenticationToken(
                customUser,
                null,
                authorities
        );
        authToken.setDetails(new WebAuthenticationDetailsSource()
                .buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authToken);

        filterChain.doFilter(request, response);
    }
}

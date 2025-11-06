package com.team.LetsStudyNow_rg.member;

import com.team.LetsStudyNow_rg.auth.CustomUser;
import com.team.LetsStudyNow_rg.dto.LoginDto;
import com.team.LetsStudyNow_rg.dto.ProfileDto;
import com.team.LetsStudyNow_rg.dto.RegisterDto;
import com.team.LetsStudyNow_rg.jwt.JwtUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MemberService {
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManagerBuilder authenticationManagerBuilder;
    final int ACCESS_TIME = 60 * 60;

    // 로그인 로직
    @Transactional
    public void loginService(
            LoginDto req,
            HttpServletResponse response
    ) {
        var authToken = new UsernamePasswordAuthenticationToken(
                req.username(), req.password()
        );
        var auth = authenticationManagerBuilder.getObject().authenticate(authToken);
        SecurityContextHolder.getContext().setAuthentication(auth);
        var auth2 = SecurityContextHolder.getContext().getAuthentication();
        var jwt = JwtUtil.createToken(auth2);

        // 쿠키에 jwt 저장
        ResponseCookie cookie = ResponseCookie.from("jwt", jwt)
                .maxAge(ACCESS_TIME) // 유효 시간 (1시간)
                .path("/") // 모든 경로에서 쿠기 사용
                .httpOnly(true) // JavaScript에서 접근 불가 (보안)
                .secure(true) // HTTPS에서만 전송 (만약 배포 시 변경)
                .sameSite("None") // 크로스 도메인 쿠기 전송 허용
                .build();

        response.addHeader("Set-Cookie", cookie.toString());
    }

    // 회원가입 로직
    @Transactional
    public void registerService(RegisterDto req) {
        if (memberRepository.existsByEmail(req.email())) {
            throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
        }
        if (memberRepository.existsByUsername(req.username())) {
            throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
        }
        // 비밀번호 암호화
        String encodePw = passwordEncoder.encode(req.password());

        Member member = new Member();
        member.setUsername(req.username());
        member.setEmail(req.email());
        member.setPassword(encodePw);
        member.setAge(req.age());
        member.setRole("ROLE_USER");
        member.setProfileImage(req.profileImageFile());
        member.setStudyField(req.studyField());
        member.setBio(req.bio());
        memberRepository.save(member);
    }

    // 마이프로필 로직
    @Transactional(readOnly = true)
    public ProfileDto profileService(CustomUser customUser) {
        var user = memberRepository.findById(customUser.id).orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));
        ProfileDto profileDto = new ProfileDto(
                user.getEmail(),
                user.getUsername(),
                user.getAge(),
                user.getProfileImage(),
                user.getStudyField(),
                user.getBio()
        );
        return profileDto;
    }
}

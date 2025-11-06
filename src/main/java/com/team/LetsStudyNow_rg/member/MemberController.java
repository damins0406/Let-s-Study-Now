package com.team.LetsStudyNow_rg.member;

import com.team.LetsStudyNow_rg.auth.CustomUser;
import com.team.LetsStudyNow_rg.dto.LoginDto;
import com.team.LetsStudyNow_rg.dto.ProfileDto;
import com.team.LetsStudyNow_rg.dto.RegisterDto;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class MemberController {
    private final MemberService memberService;
    // 로그인 api
    @PostMapping("/api/loginAct")
    public ResponseEntity loginAct(
            @Valid @RequestBody LoginDto req,
            BindingResult br,
            HttpServletResponse response
            )
    {
        if(br.hasErrors()){
            return ResponseEntity.badRequest().body(br.getAllErrors());
        }
        try {
            memberService.loginService(req, response);
            return ResponseEntity.status(HttpStatus.CREATED).body("로그인 성공");
        } catch (Exception e){
            return ResponseEntity.badRequest().body("로그인 실패");
        }
    }

    // 회원가입 api
    @PostMapping("api/registerAct")
    public ResponseEntity registerAct(
            @Valid @RequestBody RegisterDto req,
            BindingResult br
    ){
        if(br.hasErrors()){
            System.out.println(br.getAllErrors());
            return ResponseEntity.badRequest().body(br.getAllErrors());
        }

        try{
            memberService.registerService(req);
            return ResponseEntity.status(HttpStatus.CREATED).body("회원가입 성공");
        } catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 마이프로필 api
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/profile")
    public ResponseEntity profile(Authentication auth){
        try{
            var customUser = (CustomUser) auth.getPrincipal();
            ProfileDto profileDto = memberService.profileService(customUser);
            return ResponseEntity.ok(profileDto);
        } catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}

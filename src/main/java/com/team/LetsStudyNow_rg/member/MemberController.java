package com.team.LetsStudyNow_rg.member;

import com.team.LetsStudyNow_rg.auth.CustomUser;
import com.team.LetsStudyNow_rg.dto.LoginDto;
import com.team.LetsStudyNow_rg.dto.ProfileDto;
import com.team.LetsStudyNow_rg.dto.RegisterDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

@Tag(name = "1. 사용자 인증/계정 API", description = "회원가입, 로그인, 프로필 관리 등 사용자 계정 관련 API")
@RestController
@RequiredArgsConstructor
public class MemberController {
    private final MemberService memberService;
    // 로그인 api
    @Operation(summary = "로그인", description = "아이디와 비밀번호로 로그인하고, HttpOnly 쿠키에 JWT를 발급합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "로그인 성공"),
            @ApiResponse(responseCode = "400", description = "로그인 실패 (아이디 또는 비밀번호 불일치 / 입력값 오류)")
    })
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
    @Operation(summary = "회원가입", description = "새로운 사용자를 등록합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "회원가입 성공"),
            @ApiResponse(responseCode = "400", description = "입력값 유효성 검사 실패 또는 이메일/아이디 중복")
    })
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
    @Operation(summary = "마이프로필 조회", description = "현재 로그인된 사용자의 프로필 정보를 조회합니다. (인증 필요)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "프로필 조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자 (로그인 필요)"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 또는 사용자를 찾을 수 없음")
    })
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/api/profile")
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

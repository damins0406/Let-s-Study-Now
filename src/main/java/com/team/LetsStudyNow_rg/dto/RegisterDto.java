package com.team.LetsStudyNow_rg.dto;

import jakarta.validation.constraints.*;

public record RegisterDto(
        @NotBlank @Email
        String email,
        @NotBlank @Size(min = 2, max = 12, message = "아이디는 2~12자 내로 작성해주세요.")
        String username,
        @NotBlank @Size(min = 6, max = 15, message = "비밀번호는 6~15자로 작성해주세요.")
        @Pattern(
                regexp="^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]+$",
                message = "비밀번호는 영문자, 숫자, 특수기호(@$!%*#?&)를 포함해야 합니다."
        )
        String password,
        @NotBlank
        String pwCheck,

        Integer age,
        String profileImageFile,
        String studyField,
        String bio
) {
    @AssertTrue(message = "비밀번호를 확인하세요.")
    public boolean isCheckPw(){
        return password != null && password.equals(pwCheck);
    }
}

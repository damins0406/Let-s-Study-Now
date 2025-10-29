package com.team.LetsStudyNow_rg.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginDto(
        @NotBlank(message = "아이디를 입력해주세요.")
        String username,
        @NotBlank(message = "비밀번호를 입력해주세요.")
        String password
) {
}

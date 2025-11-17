package com.team.LetsStudyNow_rg.domain.member.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record EmailChangeDto(
        @NotBlank(message = "새 이메일을 입력해주세요.")
        @Email(message = "유효한 이메일 형식이 아닙니다.")
        String newEmail,

        @NotBlank(message = "현재 비밀번호를 입력해주세요.")
        String currentPassword
) {
}

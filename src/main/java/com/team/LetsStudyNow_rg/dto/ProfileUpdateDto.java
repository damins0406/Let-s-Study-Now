package com.team.LetsStudyNow_rg.dto;

import jakarta.validation.constraints.Size;

public record updateProfileDto(
        String role,
        String profileImage,
        @Size(max = 200, message = "자기소개는 200자 이내로 작성해주세요.")
        String bio
) {
}

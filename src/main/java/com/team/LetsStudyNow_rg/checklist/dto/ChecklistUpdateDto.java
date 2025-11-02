package com.team.LetsStudyNow_rg.checklist.dto;

import jakarta.validation.constraints.NotBlank;

public record ChecklistUpdateDto
        (
                @NotBlank(message = "내용을 입력해주세요.")
                String content
        ) {
}


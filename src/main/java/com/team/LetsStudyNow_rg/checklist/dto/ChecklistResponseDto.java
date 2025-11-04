package com.team.LetsStudyNow_rg.checklist.dto;

import java.time.LocalDate;

public record ChecklistResponseDto(
        Long id,
        LocalDate targetDate,
        String content,
        boolean isCompleted
) {
}

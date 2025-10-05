package com.team.LetsStudyNow_rg.dto;

public record ProfileDto(
        String email,
        String username,
        Integer age,
        String profileImage,
        String studyField,
        String bio
) {
}

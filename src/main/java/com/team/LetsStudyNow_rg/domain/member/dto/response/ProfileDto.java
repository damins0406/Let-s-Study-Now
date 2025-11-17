package com.team.LetsStudyNow_rg.domain.member.dto.response;

public record ProfileDto(
        String email,
        String username,
        Integer age,
        String profileImage,
        String studyField,
        String bio
) {
}

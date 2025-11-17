package com.team.LetsStudyNow_rg.domain.member.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Member {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email; // 이메일
    @Column(unique = true, nullable = false)
    private String username; // 아이디
    @Column(nullable = false)
    private String password; // 비밀번호

    private Integer age; // 나이
    private String role; // 권한
    private String profileImage; // 프로필 사진 (임시)
    private String studyField; // 공부 분야
    @Column(length = 500)
    private String bio; // 자기소개
}

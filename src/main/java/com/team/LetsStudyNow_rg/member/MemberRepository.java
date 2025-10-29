package com.team.LetsStudyNow_rg.member;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {
    boolean existsByEmail(String email); // 계정 생성 시 이메일 존재 여부 확인
    boolean existsByUsername(String username); // 아이디 존재 여부 확인
    Optional<Member> findByUsername(String username);
}

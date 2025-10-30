package com.team.LetsStudyNow_rg.member;

import com.team.LetsStudyNow_rg.auth.CustomUser;
import com.team.LetsStudyNow_rg.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MemberUpdateService {
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    // 마이프로필 수정 로직
    @Transactional
    public ProfileDto updateProfileService(CustomUser customUser, ProfileUpdateDto req) {
        Member user = memberRepository.findById(customUser.id)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자를 찾을 수 없습니다."));

        if (req.profileImage() != null) {
            user.setProfileImage(req.profileImage());
        }
        if (req.studyField() != null) {
            user.setStudyField(req.studyField());
        }
        if (req.bio() != null) {
            user.setBio(req.bio());
        }

        return new ProfileDto(
                user.getEmail(),
                user.getUsername(),
                user.getAge(),
                user.getProfileImage(),
                user.getStudyField(),
                user.getBio()
        );
    }

    // 이메일 변경 로직
    @Transactional
    public void updateEmail(CustomUser customUser, EmailChangeDtd req) {
        Member user = memberRepository.findById(customUser.id)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (!passwordEncoder.matches(req.currentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }

        if (memberRepository.existsByEmail(req.newEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        user.setEmail(req.newEmail());
    }

    // 비밀번호 변경 로직
    @Transactional
    public void changePassword(CustomUser customUser, PasswordChangeDto req) {
        Member user = memberRepository.findById(customUser.id)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 현재 비밀번호 불일치 시 예외처리
        if (!passwordEncoder.matches(req.currentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }
        if (!req.newPassword().equals(req.newPasswordCheck())) {
            throw new IllegalArgumentException("새로운 비밀번호가 일치하지 않습니다.");
        }
        var newPassword = passwordEncoder.encode(req.newPassword());
        user.setPassword(newPassword);
    }

    // 회원탈퇴 로직
    @Transactional
    public void deleteAccount(CustomUser customUser, AccountDeleteDto req) {
        Member user = memberRepository.findById(customUser.id)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (!passwordEncoder.matches(req.password(), user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }
        memberRepository.delete(user);
    }
}

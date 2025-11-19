package com.team.LetsStudyNow_rg.domain.member.service;

import com.team.LetsStudyNow_rg.domain.member.dto.request.AccountDeleteDto;
import com.team.LetsStudyNow_rg.domain.member.dto.request.EmailChangeDto;
import com.team.LetsStudyNow_rg.domain.member.dto.request.PasswordChangeDto;
import com.team.LetsStudyNow_rg.domain.member.dto.request.ProfileUpdateDto;
import com.team.LetsStudyNow_rg.domain.member.dto.response.ProfileDto;
import com.team.LetsStudyNow_rg.domain.member.entity.Member;
import com.team.LetsStudyNow_rg.domain.member.exception.DuplicateEmailException;
import com.team.LetsStudyNow_rg.domain.member.exception.MemberNotFoundException;
import com.team.LetsStudyNow_rg.domain.member.exception.PasswordMismatchException;
import com.team.LetsStudyNow_rg.domain.member.repository.MemberRepository;
import com.team.LetsStudyNow_rg.global.auth.CustomUser;
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
        // 커스텀 예외 적용
        Member user = memberRepository.findById(customUser.id)
                .orElseThrow(() -> new MemberNotFoundException(customUser.id));

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
    public void updateEmail(CustomUser customUser, EmailChangeDto req) {
        Member user = memberRepository.findById(customUser.id)
                .orElseThrow(() -> new MemberNotFoundException(customUser.id));

        // 커스텀 예외 적용
        if (!passwordEncoder.matches(req.currentPassword(), user.getPassword())) {
            throw new PasswordMismatchException("현재 비밀번호가 일치하지 않습니다.");
        }

        if (memberRepository.existsByEmail(req.newEmail())) {
            throw new DuplicateEmailException(req.newEmail());
        }

        user.setEmail(req.newEmail());
    }

    // 비밀번호 변경 로직
    @Transactional
    public void changePassword(CustomUser customUser, PasswordChangeDto req) {
        Member user = memberRepository.findById(customUser.id)
                .orElseThrow(() -> new MemberNotFoundException(customUser.id));

        // 커스텀 예외 적용
        if (!passwordEncoder.matches(req.currentPassword(), user.getPassword())) {
            throw new PasswordMismatchException("현재 비밀번호가 일치하지 않습니다.");
        }

        if (!req.newPassword().equals(req.newPasswordCheck())) {
            throw new PasswordMismatchException("새로운 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
        }

        var newPassword = passwordEncoder.encode(req.newPassword());
        user.setPassword(newPassword);
    }

    // 회원탈퇴 로직
    @Transactional
    public void deleteAccount(CustomUser customUser, AccountDeleteDto req) {
        Member user = memberRepository.findById(customUser.id)
                .orElseThrow(() -> new MemberNotFoundException(customUser.id));

        // 커스텀 예외 적용
        if (!passwordEncoder.matches(req.password(), user.getPassword())) {
            throw new PasswordMismatchException("비밀번호가 일치하지 않습니다.");
        }
        memberRepository.delete(user);
    }
}
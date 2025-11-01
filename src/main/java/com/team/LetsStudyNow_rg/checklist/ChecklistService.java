package com.team.LetsStudyNow_rg.checklist;

import com.team.LetsStudyNow_rg.auth.CustomUser;
import com.team.LetsStudyNow_rg.checklist.dto.ChecklistCreateDto;
import com.team.LetsStudyNow_rg.checklist.dto.ChecklistResponseDto;
import com.team.LetsStudyNow_rg.member.Member;
import com.team.LetsStudyNow_rg.member.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ChecklistService {
    private final ChecklistRepository checklistRepository;
    private final MemberRepository memberRepository;

    // 체크리스트 생성 로직
    @Transactional
    public ChecklistResponseDto createChecklist(CustomUser customUser, ChecklistCreateDto req) {
        Member member = memberRepository.findById(customUser.id)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        Checklist checklist = new Checklist();
        checklist.setMember(member);
        checklist.setTargetDate(req.targetDate());
        checklist.setContent(req.content());


        var savedChecklist = checklistRepository.save(checklist);
        ChecklistResponseDto responseDto = new ChecklistResponseDto(
                savedChecklist.getId(),
                savedChecklist.getTargetDate(),
                savedChecklist.getContent(),
                savedChecklist.isCompleted()
        );

        return responseDto;
    }

}

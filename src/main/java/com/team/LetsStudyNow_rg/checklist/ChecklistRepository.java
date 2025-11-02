package com.team.LetsStudyNow_rg.checklist;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ChecklistRepository extends JpaRepository<Checklist, Long> {
    // 특정 사용자의 특정 날짜의 체크리스트 조회
    List<Checklist> findByMemberIdAndTargetDate(Long MemberId, LocalDate targetDate);
}

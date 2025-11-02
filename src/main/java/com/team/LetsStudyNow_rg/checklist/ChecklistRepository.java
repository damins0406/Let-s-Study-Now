package com.team.LetsStudyNow_rg.checklist;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ChecklistRepository extends JpaRepository<Checklist, Long> {
    // 특정 사용자의 특정 날짜의 체크리스트 조회
    List<Checklist> findByMemberIdAndTargetDate(Long MemberId, LocalDate targetDate);

    // 특정 월에 대한 체크리스트가 있는 날짜(일) 조회
    @Query("SELECT DISTINCT DAY(c.targetDate) " +
            "FROM Checklist c " +
            "WHERE c.member.id = :memberId AND YEAR(c.targetDate) = :year AND MONTH(c.targetDate) = :month")
    List<Integer> findDaysWithChecklistByMonth(
            @Param("memberId") Long memberId,
            @Param("year") int year,
            @Param("month") int month
    );
}

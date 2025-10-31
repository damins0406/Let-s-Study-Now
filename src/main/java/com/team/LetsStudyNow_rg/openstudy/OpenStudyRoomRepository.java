package com.team.LetsStudyNow_rg.openstudy;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OpenStudyRoomRepository extends JpaRepository<OpenStudyRoom, Long> {
    
    /**
     * 활성 상태인 방 목록 조회 (최신순)
     */
    List<OpenStudyRoom> findByStatusOrderByCreatedAtDesc(RoomStatus status);
    
    /**
     * 여러 상태의 방 목록 조회 (최신순)
     * ACTIVE + PENDING_DELETE 방 모두 조회용
     */
    List<OpenStudyRoom> findByStatusInOrderByCreatedAtDesc(List<RoomStatus> statuses);
    
    /**
     * 삭제 예정 시간이 지난 방 조회
     */
    @Query("SELECT r FROM OpenStudyRoom r WHERE r.status = :status AND r.deleteScheduledAt <= :now")
    List<OpenStudyRoom> findRoomsToDelete(
        @Param("status") RoomStatus status, 
        @Param("now") LocalDateTime now
    );
    
    /**
     * 생성자 혼자 5분 경과한 방 조회 (15.1.1)
     */
    @Query("SELECT r FROM OpenStudyRoom r WHERE r.status = 'ACTIVE' " +
           "AND r.currentParticipants = 1 " +
           "AND r.aloneTimerStartedAt IS NOT NULL " +
           "AND r.aloneTimerStartedAt <= :fiveMinutesAgo")
    List<OpenStudyRoom> findAloneRoomsExpired(@Param("fiveMinutesAgo") LocalDateTime fiveMinutesAgo);
    
    /**
     * 참여자가 없는 활성 방 조회
     */
    @Query("SELECT r FROM OpenStudyRoom r WHERE r.status = :status AND r.currentParticipants = 0")
    List<OpenStudyRoom> findEmptyActiveRooms(@Param("status") RoomStatus status);
    
    /**
     * 참여자가 1명인 삭제 대기 방 조회 (15.1.2)
     */
    @Query("SELECT r FROM OpenStudyRoom r WHERE r.status = 'PENDING_DELETE' AND r.currentParticipants = 1")
    List<OpenStudyRoom> findSingleParticipantPendingRooms();
}

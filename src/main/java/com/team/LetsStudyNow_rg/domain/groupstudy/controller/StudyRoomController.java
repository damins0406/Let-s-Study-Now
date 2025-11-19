package com.team.LetsStudyNow_rg.domain.groupstudy.controller;

import com.team.LetsStudyNow_rg.domain.groupstudy.dto.CreateStudyRoomRequest;
import com.team.LetsStudyNow_rg.domain.groupstudy.dto.StudyRoomResponse;
import com.team.LetsStudyNow_rg.domain.groupstudy.service.StudyRoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "StudyRoom", description = "스터디방 관리 API")
@RestController
@RequestMapping("/api/study-rooms")
public class StudyRoomController {

    private final StudyRoomService studyRoomService;

    // 생성자 주입
    public StudyRoomController(StudyRoomService studyRoomService) {
        this.studyRoomService = studyRoomService;
    }

    // 스터디방 생성 (SRS 6.1.1~6.1.8)
    @Operation(summary = "스터디방 생성", description = "새로운 스터디방을 생성합니다")
    @PostMapping
    public ResponseEntity<StudyRoomResponse> createRoom(@RequestBody CreateStudyRoomRequest request) {
        StudyRoomResponse response = studyRoomService.createRoom(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 스터디방 단건 조회
    @Operation(summary = "스터디 방 조회", description = "스터디 방 정보를 조회합니다")
    @GetMapping("/{roomId}")
    public ResponseEntity<StudyRoomResponse> getRoom(@PathVariable Long roomId) {
        StudyRoomResponse response = studyRoomService.getRoom(roomId);
        return ResponseEntity.ok(response);
    }

    // 그룹의 스터디방 목록 조회 (SRS 6.4.1~6.4.3)
    @Operation(summary = "그룹 스터디방 목록", description = "진행 중인 특정 그룹의 스터디 방 목록을 조회합니다")
    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<StudyRoomResponse>> getGroupRooms(@PathVariable Long groupId) {
        List<StudyRoomResponse> responses = studyRoomService.getGroupRooms(groupId);
        return ResponseEntity.ok(responses);
    }

    // 전체 활성화된 스터디방 목록
    @Operation(summary = "전체 스터디방 목록", description = "진행 중인 모든 스터디 방 목록을 조회합니다")
    @GetMapping
    public ResponseEntity<List<StudyRoomResponse>> getAllRooms() {
        List<StudyRoomResponse> responses = studyRoomService.getAllActiveRooms();
        return ResponseEntity.ok(responses);
    }

    // 스터디방 입장 (SRS 6.5.1)
    @Operation(summary = "스터디방 입장", description = "스터디방에 입장합니다")
    @PostMapping("/{roomId}/join")
    public ResponseEntity<Void> joinRoom(
            @PathVariable Long roomId,
            @RequestParam Long memberId) {
        studyRoomService.joinRoom(roomId, memberId);
        return ResponseEntity.ok().build();
    }

    // 스터디방 퇴장
    @Operation(summary = "스터디방 퇴장", description = "스터디방에서 퇴장합니다")
    @PostMapping("/{roomId}/leave")
    public ResponseEntity<Void> leaveRoom(
            @PathVariable Long roomId,
            @RequestParam Long memberId) {
        studyRoomService.leaveRoom(roomId, memberId);
        return ResponseEntity.ok().build();
    }

    // 스터디방 종료 (SRS 6.1.9, 6.5.3)
    @Operation(summary = "스터디방 종료", description = "스터디방을 종료합니다")
    @PostMapping("/{roomId}/end")
    public ResponseEntity<Void> endRoom(@PathVariable Long roomId) {
        studyRoomService.endRoom(roomId);
        return ResponseEntity.noContent().build();
    }
}
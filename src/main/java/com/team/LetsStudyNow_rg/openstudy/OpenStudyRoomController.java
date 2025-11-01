package com.team.LetsStudyNow_rg.openstudy;

import com.team.LetsStudyNow_rg.auth.CustomUser;
import com.team.LetsStudyNow_rg.member.Member;
import com.team.LetsStudyNow_rg.member.MemberRepository;
import com.team.LetsStudyNow_rg.openstudy.dto.OpenStudyRoomCreateDto;
import com.team.LetsStudyNow_rg.openstudy.dto.OpenStudyRoomListDto;
import com.team.LetsStudyNow_rg.openstudy.dto.RoomJoinResultDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/open-study")
@RequiredArgsConstructor
public class OpenStudyRoomController {
    
    private final OpenStudyRoomService openStudyRoomService;
    private final MemberRepository memberRepository;
    
    /**
     * 오픈 스터디 방 생성
     */
    @PostMapping("/rooms")
    public ResponseEntity<?> createRoom(
        @Valid @RequestBody OpenStudyRoomCreateDto dto,
        @AuthenticationPrincipal CustomUser user
    ) {
        Member member = memberRepository.findByUsername(user.getUsername())
            .orElseThrow(() -> new IllegalStateException("사용자를 찾을 수 없습니다"));
        
        OpenStudyRoom room = openStudyRoomService.createRoom(dto, member);
        
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(Map.of(
                "success", true,
                "message", "방이 생성되었습니다",
                "roomId", room.getId()
            ));
    }
    
    /**
     * 활성 방 목록 조회
     */
    @GetMapping("/rooms")
    public ResponseEntity<List<OpenStudyRoomListDto>> getRoomList() {
        List<OpenStudyRoomListDto> rooms = openStudyRoomService.getRoomList();
        return ResponseEntity.ok(rooms);
    }
    
    /**
     * 방 참여
     */
    @PostMapping("/rooms/{roomId}/join")
    public ResponseEntity<?> joinRoom(
        @PathVariable Long roomId,
        @AuthenticationPrincipal CustomUser user
    ) {
        Member member = memberRepository.findByUsername(user.getUsername())
            .orElseThrow(() -> new IllegalStateException("사용자를 찾을 수 없습니다"));
        
        RoomJoinResultDto result = openStudyRoomService.joinRoom(roomId, member);
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * 방 나가기
     */
    @PostMapping("/rooms/{roomId}/leave")
    public ResponseEntity<?> leaveRoom(
        @PathVariable Long roomId,
        @AuthenticationPrincipal CustomUser user
    ) {
        Member member = memberRepository.findByUsername(user.getUsername())
            .orElseThrow(() -> new IllegalStateException("사용자를 찾을 수 없습니다"));
        
        openStudyRoomService.leaveRoom(roomId, member);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "방에서 나갔습니다"
        ));
    }
    
    /**
     * 방 상세 조회
     */
    @GetMapping("/rooms/{roomId}")
    public ResponseEntity<?> getRoomDetail(@PathVariable Long roomId) {
        OpenStudyRoom room = openStudyRoomService.getRoomById(roomId);
        return ResponseEntity.ok(OpenStudyRoomListDto.from(room));
    }
}

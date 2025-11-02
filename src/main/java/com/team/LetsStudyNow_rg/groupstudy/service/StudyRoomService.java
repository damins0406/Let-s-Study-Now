package com.team.LetsStudyNow_rg.groupstudy.service;

import com.team.LetsStudyNow_rg.groupstudy.domain.Group;
import com.team.LetsStudyNow_rg.groupstudy.domain.GroupMember;
import com.team.LetsStudyNow_rg.groupstudy.domain.StudyRoom;
import com.team.LetsStudyNow_rg.groupstudy.domain.StudyRoomParticipant;
import com.team.LetsStudyNow_rg.groupstudy.dto.CreateStudyRoomRequest;
import com.team.LetsStudyNow_rg.groupstudy.dto.StudyRoomResponse;
import com.team.LetsStudyNow_rg.groupstudy.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class StudyRoomService {

    private final StudyRoomRepository studyRoomRepository;
    private final StudyRoomParticipantRepository participantRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;

    // 생성자 주입
    public StudyRoomService(StudyRoomRepository studyRoomRepository,
                            StudyRoomParticipantRepository participantRepository,
                            GroupRepository groupRepository,
                            GroupMemberRepository groupMemberRepository) {
        this.studyRoomRepository = studyRoomRepository;
        this.participantRepository = participantRepository;
        this.groupRepository = groupRepository;
        this.groupMemberRepository = groupMemberRepository;
    }

    // 스터디방 생성 (SRS 6.1.1~6.1.8)
    @Transactional
    public StudyRoomResponse createRoom(CreateStudyRoomRequest request) {
        // 1. 그룹 존재 확인
        Group group = groupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new IllegalArgumentException("그룹을 찾을 수 없습니다"));

        // 2. 방 생성자가 그룹 멤버인지 확인 (SRS 6.1.6)
        groupMemberRepository.findByGroupIdAndMemberId(request.getGroupId(), request.getCreatorId())
                .orElseThrow(() -> new IllegalArgumentException("그룹 멤버만 스터디 방을 생성할 수 있습니다"));

        // 3. 방 이름 검증 (SRS 6.1.5)
        if (request.getRoomName() == null || request.getRoomName().trim().isEmpty()) {
            throw new IllegalArgumentException("방 이름을 입력해주세요");
        }

        // 4. 공부 시간 검증 (SRS 6.1.4)
        if (request.getStudyHours() < 1 || request.getStudyHours() > 5) {
            throw new IllegalArgumentException("공부 시간은 1시간에서 5시간 사이로 설정해야 합니다");
        }

        // 5. 인원 수 검증 (SRS 6.1.2)
        if (request.getMaxMembers() < 2 || request.getMaxMembers() > 10) {
            throw new IllegalArgumentException("인원 수는 2명에서 10명 사이로 설정해야 합니다");
        }

        // 6. 공부 분야 검증 (SRS 6.1.3)
        if (request.getStudyField() == null || request.getStudyField().trim().isEmpty()) {
            throw new IllegalArgumentException("공부 분야를 선택해야 합니다");
        }

        // 7. 스터디방 생성
        StudyRoom studyRoom = new StudyRoom(
                request.getGroupId(),
                request.getRoomName(),
                request.getStudyField(),
                request.getStudyHours(),
                request.getMaxMembers(),
                request.getCreatorId()
        );
        StudyRoom savedRoom = studyRoomRepository.save(studyRoom);

        // 8. 방 생성자는 자동 입장 (SRS 6.1.8)
        StudyRoomParticipant participant = new StudyRoomParticipant(
                savedRoom.getId(),
                request.getCreatorId()
        );
        participantRepository.save(participant);

        return new StudyRoomResponse(savedRoom);
    }

    // 스터디방 단건 조회
    public StudyRoomResponse getRoom(Long roomId) {
        StudyRoom room = studyRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("스터디 방을 찾을 수 없습니다"));
        return new StudyRoomResponse(room);
    }

    // 그룹의 스터디방 목록 조회 (SRS 6.4.1)
    public List<StudyRoomResponse> getGroupRooms(Long groupId) {
        List<StudyRoom> rooms = studyRoomRepository.findByGroupIdAndStatus(groupId, "ACTIVE");
        return rooms.stream()
                .map(StudyRoomResponse::new)
                .collect(Collectors.toList());
    }

    // 전체 활성화된 스터디방 목록
    public List<StudyRoomResponse> getAllActiveRooms() {
        List<StudyRoom> rooms = studyRoomRepository.findAll().stream()
                .filter(room -> "ACTIVE".equals(room.getStatus()))
                .collect(Collectors.toList());
        return rooms.stream()
                .map(StudyRoomResponse::new)
                .collect(Collectors.toList());
    }

    // 스터디방 입장 (SRS 6.5.1)
    @Transactional
    public void joinRoom(Long roomId, Long memberId) {
        // 1. 스터디방 존재 확인
        StudyRoom room = studyRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("스터디 방을 찾을 수 없습니다"));

        // 2. 그룹 멤버인지 확인 (SRS 6.5.2)
        groupMemberRepository.findByGroupIdAndMemberId(room.getGroupId(), memberId)
                .orElseThrow(() -> new IllegalArgumentException("그룹 멤버만 입장할 수 있습니다"));

        // 3. 이미 입장했는지 확인
        if (participantRepository.findByStudyRoomIdAndMemberId(roomId, memberId).isPresent()) {
            throw new IllegalArgumentException("이미 입장한 방입니다");
        }

        // 4. 최대 인원 확인 (SRS 6.4.4, 6.5.5)
        if (room.isFull()) {
            throw new IllegalArgumentException("최대 인원에 도달하여 입장이 불가합니다");
        }

        // 5. 방 종료 여부 확인
        if (room.isEnded()) {
            throw new IllegalArgumentException("이미 종료된 스터디 방입니다");
        }

        // 6. 입장 처리
        room.addParticipant();
        studyRoomRepository.save(room);

        StudyRoomParticipant participant = new StudyRoomParticipant(roomId, memberId);
        participantRepository.save(participant);
    }

    // 스터디방 퇴장
    @Transactional
    public void leaveRoom(Long roomId, Long memberId) {
        StudyRoom room = studyRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("스터디 방을 찾을 수 없습니다"));

        // 참여자 확인
        participantRepository.findByStudyRoomIdAndMemberId(roomId, memberId)
                .orElseThrow(() -> new IllegalArgumentException("참여하지 않은 방입니다"));

        // 퇴장 처리
        room.removeParticipant();
        studyRoomRepository.save(room);

        participantRepository.deleteByStudyRoomIdAndMemberId(roomId, memberId);
    }

    // 스터디방 종료 (SRS 6.1.9, 6.5.3)
    @Transactional
    public void endRoom(Long roomId) {
        StudyRoom room = studyRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("스터디 방을 찾을 수 없습니다"));

        // 방 종료
        room.end();
        studyRoomRepository.save(room);

        // 모든 참여자 자동 퇴장
        participantRepository.deleteByStudyRoomId(roomId);
    }

    // 종료 시간이 지난 방 자동 종료
    @Transactional
    public void autoEndExpiredRooms() {
        List<StudyRoom> activeRooms = studyRoomRepository.findAll().stream()
                .filter(room -> "ACTIVE".equals(room.getStatus()))
                .filter(StudyRoom::isEnded)
                .collect(Collectors.toList());

        for (StudyRoom room : activeRooms) {
            endRoom(room.getId());
        }
    }
}
package com.team.LetsStudyNow_rg.domain.openstudy;

import com.team.LetsStudyNow_rg.domain.member.entity.Member;
import com.team.LetsStudyNow_rg.domain.openstudy.dto.OpenStudyRoomCreateDto;
import com.team.LetsStudyNow_rg.domain.openstudy.dto.OpenStudyRoomListDto;
import com.team.LetsStudyNow_rg.domain.openstudy.dto.RoomJoinResultDto;
import com.team.LetsStudyNow_rg.domain.openstudy.exception.AlreadyInRoomException;
import com.team.LetsStudyNow_rg.domain.openstudy.exception.RoomDeletingException;
import com.team.LetsStudyNow_rg.domain.openstudy.exception.RoomFullException;
import com.team.LetsStudyNow_rg.domain.openstudy.exception.RoomNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 오픈 스터디 방의 비즈니스 로직을 처리하는 서비스
 * 방 생성, 참여/나가기, 삭제 등의 핵심 기능 제공
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class OpenStudyRoomService {

    private final OpenStudyRoomRepository roomRepository;
    private final RoomParticipantRepository participantRepository;

    /**
     * 새로운 오픈 스터디 방 생성
     *
     * 생성 과정:
     * 1. 생성자가 이미 다른 방에 참여 중인지 검증
     * 2. 방 엔티티 생성 (생성자는 자동으로 첫 번째 참여자가 됨)
     * 3. 생성자 혼자 5분 타이머 시작
     * 4. 방 저장 후 생성자를 참여자 테이블에 추가
     *
     * @param dto 방 생성 정보 (제목, 설명, 공부 분야, 최대 인원)
     * @param creator 방을 생성하는 회원
     * @return 생성된 방 엔티티
     * @throws AlreadyInRoomException 이미 다른 방에 참여 중인 경우
     */
    public OpenStudyRoom createRoom(OpenStudyRoomCreateDto dto, Member creator) {
        log.info("방 생성 시도 - 제목: {}, 생성자: {}", dto.title(), creator.getUsername());

        // 생성자가 이미 활성 상태인 다른 방에 참여 중인지 확인
        participantRepository.findActiveRoomByMemberId(creator.getId())
            .ifPresent(participant -> {
                throw new AlreadyInRoomException("방을 생성하려면 먼저 현재 방에서 나가야 합니다");
            });

        // 방 엔티티 생성 (currentParticipants는 1로 시작 = 생성자)
        OpenStudyRoom room = OpenStudyRoom.builder()
            .title(dto.title())
            .description(dto.description())
            .studyField(dto.studyField())
            .maxParticipants(dto.maxParticipants())
            .currentParticipants(1)
            .creator(creator)
            .status(RoomStatus.ACTIVE)
            .build();

        // SRS 15.1.1: 생성자 혼자 5분 타이머 시작
        // 5분 동안 다른 참여자가 없으면 방 자동 삭제
        room.startAloneTimer();

        OpenStudyRoom savedRoom = roomRepository.save(room);

        // 생성자를 참여자 테이블에 추가
        RoomParticipant participant = RoomParticipant.builder()
            .room(savedRoom)
            .member(creator)
            .build();

        participantRepository.save(participant);

        log.info("방 생성 완료 - ID: {}, 제목: {}, 혼자타이머: {}",
            savedRoom.getId(), savedRoom.getTitle(), savedRoom.getAloneTimerStartedAt());

        return savedRoom;
    }

    /**
     * 활성 상태인 방 목록 조회
     *
     * ACTIVE와 PENDING_DELETE 상태의 방을 모두 조회
     * - ACTIVE: 정상 운영 중인 방
     * - PENDING_DELETE: 삭제 예정이지만 아직 5분이 지나지 않은 방 (목록에 표시)
     *
     * @return 방 목록 DTO (최신순 정렬)
     */
    @Transactional(readOnly = true)
    public List<OpenStudyRoomListDto> getRoomList() {
        return roomRepository.findByStatusInOrderByCreatedAtDesc(
                List.of(RoomStatus.ACTIVE, RoomStatus.PENDING_DELETE))
            .stream()
            .map(OpenStudyRoomListDto::from)
            .collect(Collectors.toList());
    }

    /**
     * 오픈 스터디 방에 참여
     *
     * 참여 과정 및 검증:
     * 1. 이미 다른 방에 참여 중인지 확인
     * 2. 방이 존재하는지 확인
     * 3. 방 상태 확인 (PENDING_DELETE나 DELETED 상태면 참여 불가)
     * 4. 정원 초과 여부 확인
     * 5. 이미 해당 방에 참여 중인지 확인
     * 6. 참여자 추가 및 현재 인원 증가
     * 7. 특수 상황 처리:
     *    - 2명이 되면: 생성자 혼자 타이머 취소
     *    - 삭제 예정 상태에서 2명 이상이 되면: 삭제 예약 취소
     *
     * @param roomId 참여할 방의 ID
     * @param member 참여하려는 회원
     * @return 참여 결과 DTO
     * @throws AlreadyInRoomException 이미 다른 방에 참여 중인 경우
     * @throws RoomNotFoundException 방을 찾을 수 없는 경우
     * @throws RoomDeletingException 삭제 예정 상태의 방인 경우
     * @throws RoomFullException 방이 가득 찬 경우
     */
    public RoomJoinResultDto joinRoom(Long roomId, Member member) {
        log.info("방 참여 시도 - 방ID: {}, 회원: {}", roomId, member.getUsername());

        // 이미 다른 활성 방에 참여 중인지 확인 (한 번에 하나의 방만 참여 가능)
        participantRepository.findActiveRoomByMemberId(member.getId())
            .ifPresent(participant -> {
                throw new AlreadyInRoomException();
            });

        // 방 조회
        OpenStudyRoom room = roomRepository.findById(roomId)
            .orElseThrow(RoomNotFoundException::new);

        // SRS 15.1.4: 삭제 예정 방은 새로운 참여 불가
        if (room.getStatus() == RoomStatus.PENDING_DELETE) {
            throw new RoomDeletingException();
        }

        // 이미 삭제된 방인지 확인
        if (room.getStatus() == RoomStatus.DELETED) {
            throw new RoomNotFoundException("이미 삭제된 방입니다");
        }

        // 정원 확인 (동시 접속으로 인한 정원 초과 방지)
        if (room.isFull()) {
            throw new RoomFullException();
        }

        // 이미 해당 방에 참여 중인지 확인 (중복 참여 방지)
        if (participantRepository.existsByRoomIdAndMemberId(roomId, member.getId())) {
            throw new AlreadyInRoomException("이미 해당 방에 참여 중입니다");
        }

        // 참여자 테이블에 추가
        RoomParticipant participant = RoomParticipant.builder()
            .room(room)
            .member(member)
            .build();

        participantRepository.save(participant);
        room.incrementParticipants();

        // 2명이 되면: 생성자 혼자 타이머 취소 (더 이상 자동 삭제되지 않음)
        if (room.getCurrentParticipants() == 2) {
            room.resetAloneTimer();
            log.info("생성자 혼자 타이머 취소 - 방ID: {}", roomId);
        }

        // 삭제 예정 상태였는데 2명 이상이 되면: 삭제 예약 취소하고 활성화
        if (room.getStatus() == RoomStatus.PENDING_DELETE && room.getCurrentParticipants() >= 2) {
            room.cancelDeleteSchedule();
            log.info("방 삭제 예약 취소 - 방ID: {}, 현재인원: {}", roomId, room.getCurrentParticipants());
        }

        log.info("방 참여 완료 - 방ID: {}, 회원: {}, 현재인원: {}/{}",
            roomId, member.getUsername(), room.getCurrentParticipants(), room.getMaxParticipants());

        return RoomJoinResultDto.success(roomId);
    }

    /**
     * 오픈 스터디 방에서 나가기
     *
     * 나가기 과정:
     * 1. 해당 방에 참여 중인지 확인
     * 2. 참여자 테이블에서 제거
     * 3. 현재 인원 감소
     * 4. 남은 인원에 따른 자동 삭제 예약:
     *    - SRS 15.1.2: 1명 남음 → 5분 후 삭제 예약
     *    - SRS 15.1.3: 0명 남음 (빈 방) → 5분 후 삭제 예약
     *
     * @param roomId 나갈 방의 ID
     * @param member 나가려는 회원
     * @throws IllegalStateException 해당 방에 참여하고 있지 않은 경우
     */
    public void leaveRoom(Long roomId, Member member) {
        log.info("방 나가기 시도 - 방ID: {}, 회원: {}", roomId, member.getUsername());

        // 참여자 정보 조회 (없으면 예외 발생)
        RoomParticipant participant = participantRepository.findByRoomIdAndMemberId(roomId, member.getId())
            .orElseThrow(() -> new IllegalStateException("해당 방에 참여하고 있지 않습니다"));

        OpenStudyRoom room = participant.getRoom();

        // 참여자 테이블에서 제거 및 현재 인원 감소
        participantRepository.delete(participant);
        room.decrementParticipants();

        log.info("방 나가기 완료 - 방ID: {}, 회원: {}, 남은인원: {}",
            roomId, member.getUsername(), room.getCurrentParticipants());

        // SRS 15.1.2: 1명 남으면 5분 후 삭제 예약
        if (room.getCurrentParticipants() == 1) {
            room.scheduleDelete();
            log.info("방 삭제 예약 (1명 남음) - 방ID: {}, 삭제예정시간: {}", roomId, room.getDeleteScheduledAt());
        }
        // SRS 15.1.3: 빈 방이 되면 5분 후 삭제 예약
        else if (room.getCurrentParticipants() == 0) {
            room.scheduleDelete();
            log.info("방 삭제 예약 (빈 방) - 방ID: {}, 삭제예정시간: {}", roomId, room.getDeleteScheduledAt());
        }
    }

    /**
     * 방 ID로 방 상세 정보 조회
     *
     * @param roomId 조회할 방의 ID
     * @return 방 엔티티
     * @throws RoomNotFoundException 방을 찾을 수 없는 경우
     */
    @Transactional(readOnly = true)
    public OpenStudyRoom getRoomById(Long roomId) {
        return roomRepository.findById(roomId)
            .orElseThrow(RoomNotFoundException::new);
    }

    /**
     * 삭제 예정 시간이 지난 방 목록 조회
     * 스케줄러가 주기적으로 호출하여 삭제할 방을 찾음
     *
     * @return 삭제 대상 방 목록
     */
    @Transactional(readOnly = true)
    public List<OpenStudyRoom> getRoomsToDelete() {
        return roomRepository.findRoomsToDelete(RoomStatus.PENDING_DELETE, LocalDateTime.now());
    }

    /**
     * 생성자 혼자 5분 경과한 방 목록 조회
     * SRS 15.1.1: 생성 후 5분 동안 혼자인 방 자동 삭제용
     * 스케줄러가 주기적으로 호출
     *
     * @return 삭제 대상 방 목록 (생성자 혼자 5분 경과)
     */
    @Transactional(readOnly = true)
    public List<OpenStudyRoom> getAloneRoomsExpired() {
        LocalDateTime fiveMinutesAgo = LocalDateTime.now().minusMinutes(5);
        return roomRepository.findAloneRoomsExpired(fiveMinutesAgo);
    }

    /**
     * 방 삭제 처리 (스케줄러 전용)
     * SRS 15.1.2, 15.1.3: 삭제 예약된 방을 실제로 삭제
     *
     * 삭제 과정:
     * 1. 방이 존재하는지 확인
     * 2. 현재 참여자 수 기록 (로깅용)
     * 3. 모든 참여자를 DB에서 삭제
     * 4. currentParticipants를 0으로 업데이트
     * 5. 방 상태를 DELETED로 변경 (Soft Delete)
     *
     * @param roomId 삭제할 방의 ID
     */
    public void deleteRoom(Long roomId) {
        OpenStudyRoom room = roomRepository.findById(roomId)
            .orElse(null);

        if (room != null) {
            log.info("방 삭제 시작 - 방ID: {}, 제목: {}, 현재인원: {}",
                roomId, room.getTitle(), room.getCurrentParticipants());

            // 삭제 전 참여자 수 기록 (로깅용)
            int participantCount = room.getCurrentParticipants();

            // 참여자 테이블에서 모두 제거
            participantRepository.deleteByRoomId(roomId);

            // 방 엔티티의 currentParticipants를 0으로 업데이트
            // (방 상세 조회 시 정확한 참여자 수 표시를 위함)
            while (room.getCurrentParticipants() > 0) {
                room.decrementParticipants();
            }

            // Soft Delete: DB에서 실제 삭제하지 않고 상태만 변경
            // (데이터 보존 및 이력 관리를 위함)
            room.delete();

            log.info("방 삭제 완료 - 방ID: {}, 삭제된 참여자 수: {}", roomId, participantCount);
        }
    }

    /**
     * 생성자 혼자 있는 방 삭제 (SRS 15.1.1 전용)
     * 생성 후 5분 동안 다른 참여자가 없는 방을 삭제
     *
     * deleteRoom()과 동일한 로직이지만, 로그 메시지에 사유를 명시
     *
     * @param roomId 삭제할 방의 ID
     * @param reason 삭제 사유 (로깅용)
     */
    public void deleteAloneRoom(Long roomId, String reason) {
        OpenStudyRoom room = roomRepository.findById(roomId)
            .orElse(null);

        if (room != null) {
            log.info("방 삭제 시작 (생성자 혼자) - 방ID: {}, 제목: {}, 사유: {}",
                roomId, room.getTitle(), reason);

            // 참여자 테이블에서 모두 제거
            participantRepository.deleteByRoomId(roomId);

            // currentParticipants를 0으로 업데이트
            while (room.getCurrentParticipants() > 0) {
                room.decrementParticipants();
            }

            // Soft Delete
            room.delete();

            log.info("방 삭제 완료 (생성자 혼자) - 방ID: {}", roomId);
        }
    }
}

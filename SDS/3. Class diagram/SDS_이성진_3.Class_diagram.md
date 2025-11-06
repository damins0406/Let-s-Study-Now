# Class Diagram Documentation

---

## 3.1 DB 관리 Class diagram

## DB Class Diagram

![DB class diagram](images/DB*class* diagram.png)

### MemberRepository

**Description:** 회원 엔티티를 관리하는 인터페이스

**Operations**

| **Name**           | **Argument**      | **Returns**        | **Description**            |
| ------------------ | ----------------- | ------------------ | -------------------------- |
| `existsByEmail`    | `String mail`     | `boolean`          | 회원 이메일 중복 여부 확인 |
| `existsByUsername` | `String username` | `boolean`          | 회원 아이디 중복 여부 확인 |
| `findByUsername`   | `String username` | `Optional<Member>` | 아이디로 회원 조회         |

---

### MemberService

**Description:** 회원가입, 로그인, 프로필 조회 처리

**Attributes**

| **Name**                       | **Type**                       | **Visibility** | **Description**  |
| ------------------------------ | ------------------------------ | -------------- | ---------------- |
| `memberRepository`             | `MemberRepository`             | private        | 회원 데이터 접근 |
| `passwordEncoder`              | `PasswordEncoder`              | private        | 비밀번호 암호화  |
| `authenticationManagerBuilder` | `AuthenticationManagerBuilder` | private        | 인증 매니저 빌더 |

**Operations**

| **Name**          | **Argument**                    | **Returns**  | **Description**           |
| ----------------- | ------------------------------- | ------------ | ------------------------- |
| `loginService`    | `LoginDto, HttpServletResponse` | `void`       | 로그인 및 JWT 발급 처리   |
| `registerService` | `RegisterDto`                   | `void`       | 회원가입 처리             |
| `profileService`  | `CustomUser`                    | `ProfileDto` | 로그인 사용자 프로필 조회 |

---

### MemberUpdateService

**Description:** 회원 정보 수정/이메일·비밀번호 변경/탈퇴

**Attributes**

| **Name**           | **Type**           | **Visibility** | **Description**  |
| ------------------ | ------------------ | -------------- | ---------------- |
| `memberRepository` | `MemberRepository` | private        | 회원 데이터 접근 |
| `passwordEncoder`  | `PasswordEncoder`  | private        | 비밀번호 암호화  |

**Operations**

| **Name**               | **Argument**                    | **Returns**  | **Description**              |
| ---------------------- | ------------------------------- | ------------ | ---------------------------- |
| `updateProfileService` | `CustomUser, ProfileUpdateDto`  | `ProfileDto` | 프로필 이미지/분야/소개 수정 |
| `updateEmail`          | `CustomUser, EmailChangeDto`    | `void`       | 이메일 변경                  |
| `changePassword`       | `CustomUser, PasswordChangeDto` | `void`       | 비밀번호 변경                |
| `deleteAccount`        | `CustomUser, AccountDeleteDto`  | `void`       | 회원 탈퇴                    |

---

### MemberController

**Description:** 회원 관련 REST API 컨트롤러

**Attributes**

| **Name**              | **Type**              | **Visibility** | **Description**         |
| --------------------- | --------------------- | -------------- | ----------------------- |
| `memberService`       | `MemberService`       | private        | 가입/로그인 서비스      |
| `memberUpdateService` | `MemberUpdateService` | private        | 프로필/비번/탈퇴 서비스 |

**Operations**

| **Name**         | **Argument**                                   | **Returns**         | **Description**    |
| ---------------- | ---------------------------------------------- | ------------------- | ------------------ |
| `loginAct`       | `LoginDto, BindingResult, HttpServletResponse` | `ResponseEntity<?>` | 로그인 요청 처리   |
| `registerAct`    | `RegisterDto, BindingResult`                   | `ResponseEntity<?>` | 회원가입 요청 처리 |
| `profile`        | `Authentication`                               | `ResponseEntity<?>` | 내 프로필 조회     |
| `updateProfile`  | `ProfileUpdateDto, Authentication`             | `ResponseEntity<?>` | 프로필 수정        |
| `updateEmail`    | `EmailChangeDto, Authentication`               | `ResponseEntity<?>` | 이메일 변경        |
| `changePassword` | `PasswordChangeDto, Authentication`            | `ResponseEntity<?>` | 비밀번호 변경      |
| `accountDelete`  | `AccountDeleteDto, Authentication`             | `ResponseEntity<?>` | 회원 탈퇴          |

---

## 3.2 DTO Class diagram

![DTO Class Diagram](images/dto_class_diagram.png)

### RegisterDto

**Description:** 회원가입 입력 데이터

**Attributes**

| **Name**        | **Type**  | **Visibility** | **Description**            |
| --------------- | --------- | -------------- | -------------------------- |
| `email`         | `String`  | private        | 이메일(중복 불가)          |
| `username`      | `String`  | private        | 로그인 아이디(2~12자)      |
| `password`      | `String`  | private        | 비밀번호(영/숫/특, 6~15자) |
| `checkPassword` | `String`  | private        | 비밀번호 확인              |
| `age`           | `Integer` | private        | 선택 입력                  |
| `profileImage`  | `String`  | private        | 프로필 이미지 경로         |
| `studyField`    | `String`  | private        | 전공/공부 분야             |
| `bio`           | `String`  | private        | 자기소개                   |

**Operations**

| **Name**    | **Argument** | **Returns** | **Description**         |
| ----------- | ------------ | ----------- | ----------------------- |
| `isCheckPw` | `-`          | `boolean`   | 비밀번호/확인 일치 검증 |

---

### LoginDto

**Description:** 로그인 인증 정보

**Attributes**

| **Name**   | **Type** | **Visibility** | **Description** |
| ---------- | -------- | -------------- | --------------- |
| `username` | `String` | private        | 아이디          |
| `password` | `String` | private        | 비밀번호        |

---

### ProfileDto

**Description:** 프로필 조회 응답

**Attributes**

| **Name**       | **Type**  | **Visibility** | **Description**  |
| -------------- | --------- | -------------- | ---------------- |
| `email`        | `String`  | private        | 이메일           |
| `username`     | `String`  | private        | 아이디           |
| `password`     | `String`  | private        | (보호 필요 필드) |
| `age`          | `Integer` | private        | 나이             |
| `profileImage` | `String`  | private        | 이미지 경로      |
| `studyField`   | `String`  | private        | 분야             |
| `bio`          | `String`  | private        | 소개             |

---

### ProfileUpdateDto

**Description:** 프로필 수정 입력

**Attributes**

| **Name**       | **Type** | **Visibility** | **Description**  |
| -------------- | -------- | -------------- | ---------------- |
| `profileImage` | `String` | private        | 이미지 경로      |
| `studyField`   | `String` | private        | 분야             |
| `bio`          | `String` | private        | 소개(최대 200자) |

---

### EmailChangeDto

**Description:** 이메일 변경 입력

**Attributes**

| **Name**          | **Type** | **Visibility** | **Description**      |
| ----------------- | -------- | -------------- | -------------------- |
| `newEmail`        | `String` | private        | 새 이메일            |
| `currentPassword` | `String` | private        | 본인확인용 현재 비번 |

---

### PasswordChangeDto

**Description:** 비밀번호 변경 입력

**Attributes**

| **Name**           | **Type** | **Visibility** | **Description**    |
| ------------------ | -------- | -------------- | ------------------ |
| `currentPassword`  | `String` | private        | 현재 비번          |
| `newPassword`      | `String` | private        | 새 비번(규칙 동일) |
| `newPasswordCheck` | `String` | private        | 새 비번 확인       |

---

### AccountDeleteDto

**Description:** 회원 탈퇴 입력

**Attributes**

| **Name**   | **Type** | **Visibility** | **Description**       |
| ---------- | -------- | -------------- | --------------------- |
| `password` | `String` | private        | 탈퇴 시 비밀번호 확인 |

---

## 3.3 인증/보안 Class diagram

![인증/보안 Class Diagram](images/인증_보안_class_diagram.png)

### CustomUser

**Description:** Spring `User` 확장, 사용자 고유 정보 보유

**Attributes**

| **Name** | **Type** | **Visibility** | **Description** |
| -------- | -------- | -------------- | --------------- |
| `email`  | `String` | public         | 사용자 이메일   |
| `id`     | `Long`   | public         | 사용자 PK       |

**Operations**

| **Name**           | **Argument**                                   | **Returns** | **Description**    |
| ------------------ | ---------------------------------------------- | ----------- | ------------------ |
| `CustomUser`(ctor) | `String, String, Collection<GrantedAuthority>` | `public`    | 상위 `User` 초기화 |

---

### MyUserDetailsService

**Description:** 사용자 정보를 로드하여 `UserDetails` 생성

**Attributes**

| **Name**           | **Type**           | **Visibility** | **Description** |
| ------------------ | ------------------ | -------------- | --------------- |
| `memberRepository` | `MemberRepository` | private        | 회원 조회       |

**Operations**

| **Name**             | **Argument** | **Returns**   | **Description**                         |
| -------------------- | ------------ | ------------- | --------------------------------------- |
| `loadUserByUsername` | `String`     | `UserDetails` | 아이디로 회원 조회 후 `CustomUser` 반환 |

---

### JwtUtil

**Description:** JWT 생성/검증 유틸

**Attributes**

| **Name** | **Type**    | **Visibility** | **Description**  |
| -------- | ----------- | -------------- | ---------------- |
| `key`    | `SecretKey` | private static | 서명 키          |
| `secret` | `String`    | private        | 환경변수 주입 키 |

**Operations**

| **Name**       | **Argument**     | **Returns** | **Description**                         |
| -------------- | ---------------- | ----------- | --------------------------------------- |
| `init`         | `-`              | `void`      | 인코딩 키 디코딩하여 `SecretKey` 초기화 |
| `createToken`  | `Authentication` | `String`    | 인증 정보 기반 JWT 생성                 |
| `extractToken` | `String`         | `Claims`    | JWT에서 Claims 추출                     |

---

### JwtFilter

**Description:** 요청당 1회 실행, JWT 유효성 검사

**Operations**

| **Name**           | **Argument**                                           | **Returns** | **Description**                     |
| ------------------ | ------------------------------------------------------ | ----------- | ----------------------------------- |
| `doFilterInternal` | `HttpServletRequest, HttpServletResponse, FilterChain` | `void`      | 쿠키에서 JWT 추출/검증 후 인증 저장 |

---

### SecurityConfig

**Description:** 인증/인가 설정

**Operations**

| **Name**          | **Argument**   | **Returns**           | **Description**                   |
| ----------------- | -------------- | --------------------- | --------------------------------- |
| `passwordEncoder` | `-`            | `PasswordEncoder`     | `BCryptPasswordEncoder` Bean 등록 |
| `filterChain`     | `HttpSecurity` | `SecurityFilterChain` | 세션 비활성화/필터/예외/권한 설정 |

---

### WebConfig

**Description:** CORS 설정 (React 통신 허용)

**Operations**

| **Name**          | **Argument**   | **Returns** | **Description**                   |
| ----------------- | -------------- | ----------- | --------------------------------- |
| `addCorsMappings` | `CorsRegistry` | `void`      | Origin/메서드/헤더/쿠키 허용 설정 |

---

## 3.4 오픈 스터디 기능 Class diagram

![오픈 스터디 기능 Class Diagram](images/오픈스터디_diagram.png)

### OpenStudyRoomController

**Description:** 오픈 스터디 관련 API

**Attributes**

| **Name**               | **Type**               | **Visibility** | **Description** |
| ---------------------- | ---------------------- | -------------- | --------------- |
| `openStudyRoomService` | `OpenStudyRoomService` | private        | 로직 처리       |
| `memberRepository`     | `MemberRepository`     | private        | 사용자 조회     |

**Operations**

| **Name**        | **Argument**       | **Returns** | **Description**   |
| --------------- | ------------------ | ----------- | ----------------- |
| `createRoom`    | `dto, user`        | `void`      | 방 생성           |
| `getRoomList`   | `-`                | `void`      | 활성 방 목록 조회 |
| `joinRoom`      | `Long, CustomUser` | `void`      | 방 참여 처리      |
| `leaveRoom`     | `Long, CustomUser` | `void`      | 방 나가기         |
| `getRoomDetail` | `Long`             | `void`      | 방 상세 조회      |

---

### OpenStudyRoomService

**Description:** 오픈 스터디 비즈니스 로직

**Attributes**

| **Name**                | **Type**                    | **Visibility** | **Description** |
| ----------------------- | --------------------------- | -------------- | --------------- |
| `roomRepository`        | `OpenStudyRoomRepository`   | private        | 방 데이터       |
| `participantRepository` | `RoomParticipantRepository` | private        | 참여자 데이터   |

**Operations**

| **Name**               | **Argument**       | **Returns**         | **Description**               |
| ---------------------- | ------------------ | ------------------- | ----------------------------- |
| `createRoom`           | `dto, user`        | `OpenStudyRoom`     | 방 생성 + 생성자 자동 참여    |
| `getRoomList`          | `-`                | `List`              | 활성/삭제예정 방 최신순 조회  |
| `joinRoom`             | `Long, CustomUser` | `RoomJoinResultDto` | 중복/정원/상태 검증 후 참여   |
| `leaveRoom`            | `Long, Member`     | `void`              | 나가기, 인원 수 따라 삭제예약 |
| `getRoomById`          | `Long`             | `OpenStudyRoom`     | ID로 상세 조회(없으면 예외)   |
| `getRoomToDelete`      | `-`                | `List`              | 삭제 예정 시간 지난 방        |
| `getAloneRoomsExpired` | `-`                | `List`              | 생성자 혼자 5분 경과 방       |
| `deleteRoom`           | `Long`             | `void`              | 삭제 예정 방 실제 삭제        |
| `deleteAloneRoom`      | `Long, String`     | `void`              | 혼자 있는 방 삭제(사유 로깅)  |

---

### OpenStudyRoom (Entity)

**Description:** 오픈 스터디 방 정보

**Attributes**

| **Name**              | **Type**                | **Visibility** | **Description**       |
| --------------------- | ----------------------- | -------------- | --------------------- |
| `id`                  | `Long`                  | private        | PK                    |
| `title`               | `String`                | private        | 제목                  |
| `description`         | `String`                | private        | 설명(≤30자)           |
| `studyField`          | `String`                | private        | 공부 분야             |
| `maxParticipants`     | `int`                   | private        | 최대 인원             |
| `currentParticipants` | `int`                   | private        | 현재 인원             |
| `creator`             | `Member`                | private        | 생성자                |
| `status`              | `RoomStatus`            | private        | 상태                  |
| `createdAt`           | `LocalDateTime`         | private        | 생성 시각             |
| `deleteScheduledAt`   | `LocalDateTime`         | private        | 삭제 예정 시각        |
| `aloneTimerStartedAt` | `LocalDateTime`         | private        | 혼자 타이머 시작 시각 |
| `participants`        | `List<RoomParticipant>` | private        | 참여자 리스트         |

**Operations**

| **Name**                  | **Argument** | **Returns** | **Description**             |
| ------------------------- | ------------ | ----------- | --------------------------- |
| `incrementParticipants`   | `-`          | `void`      | 입장 시 +1                  |
| `decrementParticipants`   | `-`          | `void`      | 퇴장 시 -1 (0 미만 방지)    |
| `isFull`                  | `-`          | `boolean`   | 정원 초과 여부              |
| `scheduleDelete`          | `-`          | `void`      | 5분 후 삭제예약 설정        |
| `cancelDeleteSchedule`    | `-`          | `void`      | 삭제예약 취소, 활성 복구    |
| `startAloneTimer`         | `-`          | `void`      | 방 생성 시 타이머 시작      |
| `resetAloneTimer`         | `-`          | `void`      | 두 번째 입장 시 타이머 해제 |
| `delete`                  | `-`          | `void`      | 상태를 DELETED로 변경       |
| `isJoinable`              | `-`          | `boolean`   | 참여 가능 상태 여부         |
| `isAloneTimerExpired`     | `-`          | `boolean`   | 혼자 5분 경과 여부          |
| `isDeleteScheduleExpired` | `-`          | `boolean`   | 삭제 예정 시각 경과 여부    |

---

### OpenStudyRoomRepository

**Description:** 오픈 스터디 방용 Repository

**Operations**

| **Name**                             | **Argument**                | **Returns** | **Description**       |
| ------------------------------------ | --------------------------- | ----------- | --------------------- |
| `findByStatusOrderByCreatedAtDesc`   | `RoomStatus status`         | `List`      | 활성 방 최신순        |
| `findByStatusInOrderByCreatedAtDesc` | `List<RoomStatus>`          | `List`      | 여러 상태 최신순      |
| `findRoomsToDelete`                  | `RoomStatus, LocalDateTime` | `List`      | 삭제 예정 경과 방     |
| `findAloneRoomsExpired`              | `LocalDateTime`             | `List`      | 혼자 5분 경과 방      |
| `findEmptyActiveRooms`               | `RoomStatus`                | `List`      | 참여자 0인 활성 방    |
| `findSingleParticipantPendingRooms`  | `-`                         | `List`      | 1명 남은 삭제 대기 방 |

---

### RoomCleanupScheduler

**Description:** 스케줄러로 오래된 방 자동 삭제

**Attributes**

| **Name**               | **Type**               | **Visibility** | **Description** |
| ---------------------- | ---------------------- | -------------- | --------------- |
| `openStudyRoomService` | `OpenStudyRoomService` | private        | 서비스 의존성   |

**Operations**

| **Name**               | **Argument** | **Returns** | **Description**             |
| ---------------------- | ------------ | ----------- | --------------------------- |
| `deleteAloneRooms`     | `-`          | `void`      | 혼자 5분 경과 방 자동 삭제  |
| `deleteScheduledRooms` | `-`          | `void`      | 삭제 예정 경과 방 자동 삭제 |

---

### RoomParticipant (Entity)

**Description:** 방 참여자

**Attributes**

| **Name**   | **Type**        | **Visibility** | **Description** |
| ---------- | --------------- | -------------- | --------------- |
| `id`       | `Long`          | private        | PK              |
| `room`     | `OpenStudyRoom` | private        | 방              |
| `member`   | `Member`        | private        | 회원            |
| `joinedAt` | `LocalDateTime` | private        | 참여 시각       |

---

### RoomParticipantRepository

**Description:** 방 참여자 Repository

**Operations**

| **Name**                    | **Argument** | **Returns** | **Description**             |
| --------------------------- | ------------ | ----------- | --------------------------- |
| `existsByRoomIdAndMemberId` | `Long, Long` | `boolean`   | 중복 참여 확인              |
| `findByRoomId`              | `Long`       | `List`      | 방별 참여자 조회            |
| `findActiveRoomByMemberId`  | `Long`       | `Optional`  | 회원이 참여 중인 활성 방    |
| `findByRoomIdAndMemberId`   | `Long, Long` | `Optional`  | 특정 회원 참여 정보         |
| `deleteByRoomId`            | `Long`       | `void`      | 방 삭제 시 참여자 일괄 삭제 |

---

## 3.5 그룹 스터디 Class diagram

### 3.5.1 Domain

![그룹스터디 Domain](images/그룹스터디_domain.png)

#### Group (Entity)

**Description:** 스터디 그룹 기본 정보

**Attributes**

| **Name**    | **Type**        | **Visibility** | **Description** |
| ----------- | --------------- | -------------- | --------------- |
| `id`        | `Long`          | private        | PK              |
| `groupName` | `String`        | private        | 그룹명          |
| `leaderId`  | `Long`          | private        | 리더 ID         |
| `createdAt` | `LocalDateTime` | private        | 생성일시        |

**Operations(요약)**: `Group(name, leaderId)`, getters

---

#### GroupMember (Entity)

**Description:** 그룹 소속 멤버

**Attributes**

| **Name**   | **Type**        | **Visibility** | **Description** |
| ---------- | --------------- | -------------- | --------------- |
| `id`       | `Long`          | private        | PK              |
| `groupId`  | `Long`          | private        | 그룹 ID         |
| `memberId` | `Long`          | private        | 멤버 ID         |
| `role`     | `String`        | private        | LEADER/MEMBER   |
| `joinedAt` | `LocalDateTime` | private        | 참여 일시       |

**Operations(요약)**: `GroupMember(groupId, memberId, role)`, `isLeader()`

---

#### StudyRoom (Entity)

**Description:** 그룹 내 스터디방

**Attributes**

| **Name**         | **Type**        | **Visibility** | **Description** |
| ---------------- | --------------- | -------------- | --------------- |
| `id`             | `Long`          | private        | PK              |
| `groupId`        | `Long`          | private        | 그룹 ID         |
| `roomName`       | `String`        | private        | 방 이름         |
| `studyField`     | `String`        | private        | 분야            |
| `studyHours`     | `Integer`       | private        | 1~5시간         |
| `maxMembers`     | `Integer`       | private        | 최대 인원       |
| `currentMembers` | `Integer`       | private        | 현재 인원       |
| `creatorId`      | `Long`          | private        | 생성자 ID       |
| `createdAt`      | `LocalDateTime` | private        | 생성 시각       |
| `endTime`        | `LocalDateTime` | private        | 종료 시각       |
| `status`         | `String`        | private        | ACTIVE/ENDED    |

**Operations**

| **Name**            | **Argument** | **Returns** | **Description**     |
| ------------------- | ------------ | ----------- | ------------------- |
| `addParticipant`    | `-`          | `void`      | 입장 시 인원 증가   |
| `removeParticipant` | `-`          | `void`      | 퇴장 시 인원 감소   |
| `end`               | `-`          | `void`      | 상태를 ENDED로 변경 |
| `isFull`            | `-`          | `boolean`   | 정원 도달 여부      |
| `isEnded`           | `-`          | `boolean`   | 종료 여부           |

---

#### StudyRoomParticipant (Entity)

**Description:** 스터디방 참여 기록

**Attributes**

| **Name**      | **Type**        | **Visibility** | **Description** |
| ------------- | --------------- | -------------- | --------------- |
| `id`          | `Long`          | private        | PK              |
| `studyRoomId` | `Long`          | private        | 방 ID           |
| `memberId`    | `Long`          | private        | 멤버 ID         |
| `joinedAt`    | `LocalDateTime` | private        | 입장 시각       |

---

### 3.5.2 DTO

![그룹스터디 DTO](images/그룹스터디_dto.png)

#### AddGroupMemberRequest

| **Name**   | **Type** | **Visibility** | **Description** |
| ---------- | -------- | -------------- | --------------- |
| `groupId`  | `Long`   | private        | 대상 그룹 ID    |
| `memberId` | `Long`   | private        | 추가 멤버 ID    |

#### CreateGroupRequest

| **Name**    | **Type** | **Visibility** | **Description** |
| ----------- | -------- | -------------- | --------------- |
| `groupName` | `String` | private        | 그룹명          |
| `leaderId`  | `Long`   | private        | 리더 ID         |

#### CreateStudyRoomRequest

| **Name**     | **Type**  | **Visibility** | **Description** |
| ------------ | --------- | -------------- | --------------- |
| `groupId`    | `Long`    | private        | 그룹 ID         |
| `roomName`   | `String`  | private        | 방 이름         |
| `studyField` | `String`  | private        | 분야            |
| `studyHours` | `Integer` | private        | 시간(1~5)       |
| `maxMembers` | `Integer` | private        | 최대 인원       |
| `creatorId`  | `Long`    | private        | 생성자 ID       |

#### GroupMemberResponse

| **Name**   | **Type**        | **Visibility** | **Description** |
| ---------- | --------------- | -------------- | --------------- |
| `id`       | `Long`          | private        | 레코드 ID       |
| `memberId` | `Long`          | private        | 멤버 ID         |
| `role`     | `String`        | private        | 역할            |
| `joinedAt` | `LocalDateTime` | private        | 참여 일시       |

#### GroupResponse

| **Name**    | **Type**        | **Visibility** | **Description** |
| ----------- | --------------- | -------------- | --------------- |
| `id`        | `Long`          | private        | 그룹 PK         |
| `groupName` | `String`        | private        | 그룹명          |
| `leaderId`  | `Long`          | private        | 리더 ID         |
| `createdAt` | `LocalDateTime` | private        | 생성일시        |

#### StudyRoomResponse

| **Name**           | **Type**        | **Visibility** | **Description**     |
| ------------------ | --------------- | -------------- | ------------------- |
| `id`               | `Long`          | private        | 방 PK               |
| `groupId`          | `Long`          | private        | 그룹 ID             |
| `roomName`         | `String`        | private        | 방 이름             |
| `studyField`       | `String`        | private        | 분야                |
| `studyHours`       | `Integer`       | private        | 시간                |
| `maxMembers`       | `Integer`       | private        | 최대 인원           |
| `currentMembers`   | `Integer`       | private        | 현재 인원           |
| `creatorId`        | `Long`          | private        | 생성자 ID           |
| `createdAt`        | `LocalDateTime` | private        | 생성 시각           |
| `endTime`          | `LocalDateTime` | private        | 종료 시각           |
| `status`           | `String`        | private        | ACTIVE/ENDED        |
| `remainingMinutes` | `Long`          | private        | (ACTIVE 시) 남은 분 |

---

### 3.5.3 Services

![그룹스터디 Service](images/그룹스터디_service.png)

#### GroupService

**Operations**

| **Name**       | **Argument**         | **Returns**           | **Description**                   |
| -------------- | -------------------- | --------------------- | --------------------------------- |
| `createGroup`  | `CreateGroupRequest` | `GroupResponse`       | 그룹 생성/저장/응답               |
| `getGroup`     | `Long`               | `GroupResponse`       | 그룹 단건 조회                    |
| `getMyGroups`  | `Long`               | `List<GroupResponse>` | 내가 만든 그룹 목록               |
| `getAllGroups` | `-`                  | `List<GroupResponse>` | 전체 그룹 목록                    |
| `deleteGroup`  | `Long, Long`         | `void`                | 리더이면서 다른 멤버 없을 때 삭제 |

#### GroupMemberService

**Operations**

| **Name**          | **Argument**            | **Returns**                 | **Description**               |
| ----------------- | ----------------------- | --------------------------- | ----------------------------- |
| `addMember`       | `AddGroupMemberRequest` | `GroupMemberResponse`       | 중복 금지 후 추가             |
| `getGroupMembers` | `Long`                  | `List<GroupMemberResponse>` | 멤버 목록 조회                |
| `removeMember`    | `Long, Long, Long`      | `void`                      | 리더 권한으로 추방(본인 제외) |

#### StudyRoomService

**Operations**

| **Name**              | **Argument**             | **Returns**               | **Description**             |
| --------------------- | ------------------------ | ------------------------- | --------------------------- |
| `createRoom`          | `CreateStudyRoomRequest` | `StudyRoomResponse`       | 검증 포함 생성              |
| `getRoom`             | `Long`                   | `StudyRoomResponse`       | 단건 조회                   |
| `getGroupRooms`       | `Long`                   | `List<StudyRoomResponse>` | 그룹별 목록                 |
| `getAllActiveRooms`   | `-`                      | `List<StudyRoomResponse>` | 전체 활성 목록              |
| `joinRoom`            | `Long, Long`             | `void`                    | 멤버/정원/종료 확인 후 입장 |
| `leaveRoom`           | `Long, Long`             | `void`                    | 퇴장 처리                   |
| `endRoom`             | `Long`                   | `void`                    | 종료 및 참여자 정리         |
| `autoEndExpiredRooms` | `-`                      | `void`                    | 종료 시각 경과 방 자동 종료 |

---

### 3.5.4 Controllers

![그룹스터디 Controller](images/그룹스터디_controller.png)

#### GroupController

| **Name**       | **Argument**         | **Returns**                           | **Description**                |
| -------------- | -------------------- | ------------------------------------- | ------------------------------ |
| `createGroup`  | `CreateGroupRequest` | `ResponseEntity<GroupResponse>`       | POST `/api/groups`             |
| `getGroup`     | `Long`               | `ResponseEntity<GroupResponse>`       | GET `/api/groups/{groupId}`    |
| `getAllGroups` | `-`                  | `ResponseEntity<List<GroupResponse>>` | GET `/api/groups`              |
| `getMyGroups`  | `Long`               | `ResponseEntity<List<GroupResponse>>` | GET `/api/groups/my`           |
| `deleteGroup`  | `Long, Long`         | `ResponseEntity<Void>`                | DELETE `/api/groups/{groupId}` |

#### GroupMemberController

| **Name**       | **Argument**                  | **Returns**                                 | **Description**                                   |
| -------------- | ----------------------------- | ------------------------------------------- | ------------------------------------------------- |
| `addMember`    | `Long, AddGroupMemberRequest` | `ResponseEntity<GroupMemberResponse>`       | POST `/api/groups/{groupId}/members`              |
| `getMembers`   | `Long`                        | `ResponseEntity<List<GroupMemberResponse>>` | GET `/api/groups/{groupId}/members`               |
| `removeMember` | `Long, Long, Long`            | `ResponseEntity<Void>`                      | DELETE `/api/groups/{groupId}/members/{memberId}` |

#### StudyRoomController

| **Name**        | **Argument**             | **Returns**                               | **Description**                                  |
| --------------- | ------------------------ | ----------------------------------------- | ------------------------------------------------ |
| `createRoom`    | `CreateStudyRoomRequest` | `ResponseEntity<StudyRoomResponse>`       | POST `/api/study-rooms`                          |
| `getRoom`       | `Long`                   | `ResponseEntity<StudyRoomResponse>`       | GET `/api/study-rooms/{roomId}`                  |
| `getGroupRooms` | `Long`                   | `ResponseEntity<List<StudyRoomResponse>>` | GET `/api/study-rooms/group/{groupId}`           |
| `getAllRooms`   | `-`                      | `ResponseEntity<List<StudyRoomResponse>>` | GET `/api/study-rooms`                           |
| `joinRoom`      | `Long, Long`             | `ResponseEntity<Void>`                    | POST `/api/study-rooms/{roomId}/join?memberId=`  |
| `leaveRoom`     | `Long, Long`             | `ResponseEntity<Void>`                    | POST `/api/study-rooms/{roomId}/leave?memberId=` |
| `endRoom`       | `Long`                   | `ResponseEntity<Void>`                    | POST `/api/study-rooms/{roomId}/end`             |

---

### 3.5.5 Repositories

![그룹스터디 Repository](images/그룹스터디_repository.png)

#### GroupRepository

| **Name**          | **Argument** | **Returns**       | **Description**      |
| ----------------- | ------------ | ----------------- | -------------------- |
| `findByLeaderId`  | `Long`       | `List<Group>`     | 리더가 만든 그룹     |
| `findByGroupName` | `String`     | `Optional<Group>` | 그룹명으로 단건 조회 |

#### GroupMemberRepository

| **Name**                     | **Argument** | **Returns**             | **Description** |
| ---------------------------- | ------------ | ----------------------- | --------------- |
| `findByGroupId`              | `Long`       | `List<GroupMember>`     | 그룹 멤버 전체  |
| `findByGroupIdAndMemberId`   | `Long, Long` | `Optional<GroupMember>` | 단건 조회       |
| `countByGroupId`             | `Long`       | `long`                  | 인원 수         |
| `deleteByGroupIdAndMemberId` | `Long, Long` | `void`                  | 특정 멤버 삭제  |

#### StudyRoomRepository

| **Name**                 | **Argument**   | **Returns**       | **Description**  |
| ------------------------ | -------------- | ----------------- | ---------------- |
| `findByGroupId`          | `Long`         | `List<StudyRoom>` | 그룹의 모든 방   |
| `findByGroupIdAndStatus` | `Long, String` | `List<StudyRoom>` | 상태별 조회      |
| `findByCreatorId`        | `Long`         | `List<StudyRoom>` | 사용자가 만든 방 |

#### StudyRoomParticipantRepository

| **Name**                         | **Argument** | **Returns**                      | **Description**  |
| -------------------------------- | ------------ | -------------------------------- | ---------------- |
| `findByStudyRoomId`              | `Long`       | `List<StudyRoomParticipant>`     | 방의 모든 참여자 |
| `findByStudyRoomIdAndMemberId`   | `Long, Long` | `Optional<StudyRoomParticipant>` | 특정 멤버 참여   |
| `countByStudyRoomId`             | `Long`       | `long`                           | 참여자 수        |
| `deleteByStudyRoomIdAndMemberId` | `Long, Long` | `void`                           | 특정 멤버 삭제   |

---

## 3.6 체크리스트 Class diagram

![체크리스트 Diagram](images/체크리스트_diagram.png)

**Description:** 체크리스트 도메인의 구조와 주요 동작을 한눈에 정리한다.

### Checklist (Entity)

**Attributes**

| Name        | Type      | Visibility | Description               |
| ----------- | --------- | ---------- | ------------------------- |
| id          | Long      | private    | 체크리스트 PK             |
| member      | Member    | private    | 소유 사용자(FK=member_id) |
| targetDate  | LocalDate | private    | 대상 날짜                 |
| content     | String    | private    | 항목 내용                 |
| isCompleted | boolean   | private    | 완료 여부                 |

**Operations**

| Name          | Argument          | Returns | Description   |
| ------------- | ----------------- | ------- | ------------- |
| complete      | -                 | void    | 완료로 전환   |
| uncomplete    | -                 | void    | 미완료로 전환 |
| updateContent | String newContent | void    | 내용 수정     |

---

### DTOs

**ChecklistCreateDto** — 생성 요청  
**Attributes**

| Name       | Type      | Validation                            | Description |
| ---------- | --------- | ------------------------------------- | ----------- |
| targetDate | LocalDate | `@NotNull("날짜를 선택해야 합니다.")` | 대상 날짜   |
| content    | String    | `@NotBlank("내용을 입력해주세요")`    | 내용        |

**ChecklistUpdateDto** — 내용 수정 요청  
**Attributes**

| Name    | Type   | Validation                          | Description |
| ------- | ------ | ----------------------------------- | ----------- |
| content | String | `@NotBlank("내용을 입력해주세요.")` | 수정 내용   |

**ChecklistResponseDto** — 조회/생성/수정 응답  
**Attributes**

| Name        | Type      | Description |
| ----------- | --------- | ----------- |
| id          | Long      | PK          |
| targetDate  | LocalDate | 대상 날짜   |
| content     | String    | 항목 내용   |
| isCompleted | boolean   | 완료 여부   |

---

### ChecklistRepository

**Operations**

| Name                               | Argument                                      | Returns             | Description           |
| ---------------------------------- | --------------------------------------------- | ------------------- | --------------------- |
| findByMemberIdAndTargetDate        | Long memberId, LocalDate date                 | List<Checklist>     | 특정 날짜 조회        |
| findByIdAndMemberId                | Long id, Long memberId                        | Optional<Checklist> | 소유자 검증 단건 조회 |
| findByMemberIdAndTargetDateBetween | Long memberId, LocalDate start, LocalDate end | List<Checklist>     | 기간 조회             |
| save                               | Checklist                                     | Checklist           | 저장/수정             |
| deleteById                         | Long id                                       | void                | 삭제                  |

---

### ChecklistService

**Operations**

| Name           | Argument                                            | Returns                    | Description      |
| -------------- | --------------------------------------------------- | -------------------------- | ---------------- |
| create         | Long memberId, ChecklistCreateDto                   | ChecklistResponseDto       | 항목 생성        |
| update         | Long memberId, Long checklistId, ChecklistUpdateDto | ChecklistResponseDto       | 내용 수정        |
| toggleComplete | Long memberId, Long checklistId                     | ChecklistResponseDto       | 완료/미완료 전환 |
| getDaily       | Long memberId, LocalDate date                       | List<ChecklistResponseDto> | 하루치 조회      |
| getRange       | Long memberId, LocalDate start, LocalDate end       | List<ChecklistResponseDto> | 기간 조회        |
| delete         | Long memberId, Long checklistId                     | void                       | 삭제             |

---

### ChecklistController (REST)

**Endpoints**

| Method | Path                                            | Request            | Response                   | Description |
| ------ | ----------------------------------------------- | ------------------ | -------------------------- | ----------- |
| POST   | /api/checklists                                 | ChecklistCreateDto | ChecklistResponseDto       | 생성        |
| PUT    | /api/checklists/{id}                            | ChecklistUpdateDto | ChecklistResponseDto       | 내용 수정   |
| PATCH  | /api/checklists/{id}/complete                   | —                  | ChecklistResponseDto       | 완료 토글   |
| GET    | /api/checklists?date=YYYY-MM-DD                 | —                  | List<ChecklistResponseDto> | 하루치 조회 |
| GET    | /api/checklists?start=YYYY-MM-DD&end=YYYY-MM-DD | —                  | List<ChecklistResponseDto> | 기간 조회   |
| DELETE | /api/checklists/{id}                            | —                  | 204 No Content             | 삭제        |

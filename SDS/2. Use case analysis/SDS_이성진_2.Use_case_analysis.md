# 2. Use Case Analysis

> This document summarizes the Use Case Diagram and detailed Use Case Descriptions for **Let’s Study Now! (LSN)**.  
> 본 장에서는 LSN 시스템의 Use Case Diagram과 각 Use Case의 상세 설명을 제공한다. 

---

## 2.1 Use Case Diagram

- 액터: **User** (일반 사용자), **Admin** (관리자)  
- 주요 기능: 회원가입(Sign Up), 로그인(Login), 로그아웃(Logout), 프로필 관리(Profile Management), 친구 초대(Friend Invite), 오픈/그룹 스터디룸 입장(Join Open/Group Study Room), 체크리스트 관리(Checklist), 화상 연결(Video), 알림(Notification) 등.

<img width="535" height="321" alt="image" src="https://github.com/FAITRUEE/Let-s-Study-Now/blob/main/SDS/2.%20Use%20case%20analysis/images/usecase_diagram.png?raw=true" />

---

## 2.2 Use Case Descriptions

---

## Use case #1: 로그인 (Login)
**Summary**  
사용자가 등록된 ID와 비밀번호로 시스템에 로그인한다.

**Primary Actor**  
User

**Preconditions**  
사용자는 회원가입이 완료되어 있어야 한다.

**Trigger**  
로그인 버튼 클릭

**Main success scenario**
1. 사용자가 ID, 비밀번호 입력
2. 로그인 버튼 클릭
3. 서버에서 인증 수행
4. 인증 성공 시 메인(스케줄) 페이지로 리디렉션

**Extensions**
- 입력란 공백 → 입력 요청 메시지 표시.
- 정보 불일치 → 오류 메시지 표시.

---

## Use case #2: 회원가입 (Sign Up)
**Summary**  
필수/선택 정보를 입력하여 계정을 생성한다.

**Primary Actor**  
User

**Preconditions**  
시스템 접속 가능 상태

**Trigger**  
회원가입 버튼 클릭

**Main success scenario**
1. 필수정보 입력
2. ID 중복검사 등 검증
3. 프로필 사진 업로드(선택)
4. 저장 후 가입 완료, 로그인 페이지로 이동

**Extensions**
- 필수정보 누락/유효성 오류 → 에러 처리 및 안내.

---

## Use case #3: 로그아웃 (Logout)
**Summary**  
사용자의 세션을 종료하고 로그아웃 상태로 만든다.

**Primary Actor**  
User

**Preconditions**  
사용자가 로그인되어 있어야 함

**Trigger**  
로그아웃 버튼 클릭

**Main success scenario**
1. 로그아웃 버튼 클릭
2. 세션/JWT 무효화
3. 클라이언트 토큰 삭제 응답
4. 로그인 페이지로 이동

**Extensions**
- 이미 로그아웃된 상태 → 안내 후 메인 이동
- 토큰 무효화 오류 → 에러 메시지 및 로깅

---

## Use case #4: 상태 메시지 등록 (Status Message)
**Summary**  
사용자가 현재 상태/기분을 메시지로 등록/수정한다.

**Primary Actor**  
User

**Preconditions**  
로그인 상태

**Trigger**  
상태 메시지 설정 메뉴 접근

**Main success scenario**
1. 입력 후 등록 클릭
2. 유효성 검사 후 DB 저장
3. 프로필 및 참여자 목록에 반영

**Extensions**
- 글자 수 초과 → 저장 거부/경고
- 등록 취소 → 변경 없음

---

## Use case #5: 친구 초대 공유 (Invite URL)
**Summary**  
고유 초대 URL을 생성해 외부로 공유한다.

**Primary Actor**  
User

**Preconditions**  
로그인 상태

**Trigger**  
친구 초대 기능 클릭

**Main success scenario**
1. 초대 URL 생성 및 표시
2. 사용자 복사/공유
3. 수신자가 접근 시 가입/로그인 흐름과 연동

**Extensions**
- URL 생성 실패 → 에러 안내
- 유효기간 만료 → 만료 메시지
- 이미 친구인 경우 → 별도 처리

---

## Use case #6: 마이 프로필 조회/수정 (Profile View/Edit)
**Summary**  
사용자가 자신의 프로필을 조회하고 수정한다.

**Primary Actor**  
User

**Preconditions**  
로그인 상태

**Trigger**  
마이 프로필 메뉴 클릭

**Main success scenario**
1. 현재 정보 표시
2. 수정 후 저장 → DB 반영
3. 성공 알림 표시

**Extensions**
- 프로필 사진 업로드 실패 → 기본 이미지 유지
- 자기소개 글자 수 초과 → 오류

---

## Use case #7: 자기소개 작성 (Introduce Yourself)
**Summary**  
자기소개를 작성/수정한다.

**Primary Actor**  
User

**Preconditions**  
로그인 및 프로필 페이지 접근

**Trigger**  
자기소개 입력 후 저장

**Main success scenario**
1. 입력 후 저장
2. 글자수(최대 200자) 검증
3. DB에 저장 및 반영

**Extensions**
- 글자수 초과 → 경고/저장 제한

---

## Use case #8: 아이디/이메일/나이 표시 (Show Basic Info)
**Summary**  
사용자의 ID, 이메일, 나이를 표시한다.

**Primary Actor**  
User

**Preconditions**  
로그인 상태, 프로필 페이지 로드

**Trigger**  
프로필 페이지 로딩

**Main success scenario**
1. DB에서 정보 조회
2. 화면에 정확히 표시

**Extensions**
- 필수 정보 누락 → '정보 없음' 표시
- 나이 미제공 → 비공개 또는 공란 처리

---

## Use case #9: 공부 분야 선택 (Select Study Subjects)
**Summary**  
사용자가 관심있는 공부 분야를 하나 이상 선택한다.

**Primary Actor**  
User

**Preconditions**  
로그인 상태

**Trigger**  
공부 분야 선택 섹션 클릭

**Main success scenario**
1. 목록에서 선택
2. 저장 → DB 반영
3. 알림 및 화면 반영

**Extensions**
- 목록 로드 실패 → 이전 목록 사용 또는 오류 안내
- 최소/최대 선택 수 제한

---

## Use case #10: 프로필 사진 업로드 (Upload Profile Picture)
**Summary**  
로컬에서 이미지를 선택해 프로필 사진으로 등록/변경한다.

**Primary Actor**  
User

**Preconditions**  
로그인 상태

**Trigger**  
업로드 버튼 클릭

**Main success scenario**
1. 이미지 선택
2. 파일 형식 검증(JPEG/PNG/GIF 등)
3. 서버 저장 및 URL 반영
4. 미리보기 및 성공 알림

**Extensions**
- 형식/크기 오류 → 업로드 거부
- 업로드 실패 → 에러 메시지

---

## Use case #11: 계정 설정 (Account Settings)
**Summary**  
비밀번호/이메일/아이디 변경, 탈퇴, 알림 설정 등 계정 관련 설정을 관리한다.

**Primary Actor**  
User

**Preconditions**  
로그인 상태

**Trigger**  
계정 설정 메뉴 진입

**Main success scenario**
1. 변경 항목 선택 및 입력
2. 검증 후 저장
3. 성공 알림

**Extensions**
- 비밀번호 변경/이메일 변경/탈퇴 관련 각종 오류 처리

---

## Use case #12: 비밀번호 변경 (Change Password)
**Summary**  
기존 비밀번호 확인 후 새 비밀번호로 변경한다.

**Primary Actor**  
User

**Preconditions**  
로그인 상태

**Trigger**  
비밀번호 변경 선택

**Main success scenario**
1. 현재 비밀번호, 새 비밀번호 입력
2. 현재 비밀번호 확인 및 보안 규칙 검증
3. 암호화 후 DB 저장
4. 성공 알림

**Extensions**
- 현재 비밀번호 불일치 → 에러
- 새 비밀번호 규칙 미충족 → 에러
- 저장 실패 → 에러

---

## Use case #13: 이메일 변경 (Change Email)
**Summary**  
등록된 이메일을 새 이메일로 변경한다(인증 포함).

**Primary Actor**  
User

**Preconditions**  
로그인 상태, 신규 이메일 사용 가능

**Trigger**  
이메일 변경 요청

**Main success scenario**
1. 새 이메일 입력
2. 이메일 형식 및 중복 검사
3. 인증 절차(메일) 수행
4. DB 업데이트 및 성공 알림

**Extensions**
- 형식 오류/중복 → 에러
- 인증 실패 → 에러

---

## Use case #14: 아이디 변경 (Change Username)
**Summary**  
본인 인증 후 새로운 아이디로 변경한다.

**Primary Actor**  
User

**Preconditions**  
로그인 상태

**Trigger**  
아이디 변경 선택

**Main success scenario**
1. 새 아이디 입력
2. 규칙 및 중복 검사
3. DB 업데이트 및 알림 (재로그인 요구 가능)

**Extensions**
- 규칙 위반/중복 → 에러

---

## Use case #15: 계정 탈퇴 (Delete Account)
**Summary**  
본인 인증 후 계정을 탈퇴하고 관련 데이터를 삭제 또는 비활성화한다.

**Primary Actor**  
User

**Preconditions**  
로그인 상태

**Trigger**  
계정 탈퇴 선택

**Main success scenario**
1. 비밀번호 재입력 등 본인 확인
2. 삭제/비활성화 처리
3. 삭제 완료 알림 및 강제 로그아웃

**Extensions**
- 비밀번호 불일치 → 에러
- DB 처리 실패 → 에러 및 안내

---

## Use case #16: 알림 설정 (Notification Settings)
**Summary**  
알림 종류·수신여부·수단 등을 설정한다.

**Primary Actor**  
User

**Preconditions**  
로그인 상태

**Trigger**  
알림 설정 메뉴 선택

**Main success scenario**
1. 알림 유형 선택/토글
2. 저장 → DB 반영
3. 성공 알림

**Extensions**
- 필수 알림 해제 시 제약 안내

---

## Use case #17: 오픈 스터디룸 입장 (Enter Open Study Room)
**Summary**  
오픈 스터디룸 목록 조회, 생성, 참여, 삭제 등의 공개 스터디 활동을 관리한다.

**Primary Actor**  
User

**Preconditions**  
로그인 상태

**Trigger**  
오픈 스터디룸 메뉴 클릭

**Main success scenario**
1. 목록 조회
2. 방 생성/참여/삭제 등 수행
3. 활동 완료 후 페이지 이탈

**Extensions**
- 생성/참여/삭제 실패 시 에러 처리

---

## Use case #18: 오픈 스터디룸 만들기 (Create Open Study Room)
**Summary**  
조건을 설정해 공개 스터디 방을 생성한다.

**Primary Actor**  
User

**Preconditions**  
로그인 상태

**Trigger**  
방 만들기 진입

**Main success scenario**
1. 필수 항목 입력(제목, 분야, 인원 등)
2. 검증 성공 시 방 저장 및 즉시 목록에 표시
3. 생성자에게 방장 권한 부여 및 입장

**Extensions**
- 필수 항목 누락 → 생성 거부

---

## Use case #19: 오픈 스터디 방 목록 조회 (List Open Study Rooms)
**Summary**  
생성된 오픈 스터디룸 목록을 카드 형태로 실시간 표시한다.

**Primary Actor**  
User

**Preconditions**  
로그인 상태

**Trigger**  
오픈 스터디룸 페이지 진입

**Main success scenario**
1. DB에서 방 목록 조회
2. 카드 형태로 표시(참여인원, 분야 등)
3. 실시간 업데이트 반영

**Extensions**
- 필터/검색 기능
- 실시간 업데이트 실패 시 수동 새로고침 안내

---

## Use case #20: 오픈 스터디 방 참여 (Join Open Study Room)
**Summary**  
목록에서 방을 선택하여 입장한다.

**Primary Actor**  
User

**Preconditions**  
로그인 상태

**Trigger**  
참여 버튼 클릭

**Main success scenario**
1. 정원/삭제 여부/중복 참여 확인
2. 조건 충족 시 멤버로 추가 및 입장
3. 참여자 수 자동 증가

**Extensions**
- 정원 초과 → 입장 불가
- 이미 삭제된 방 → 에러

---

## Use case #21: 오픈 스터디 방 삭제 (Auto Delete Open Room)
**Summary**  
참여자가 없는 방을 자동으로 감지해 삭제한다(시간 기준 등).

**Primary Actor**  
System / User

**Preconditions**  
해당 방이 생성되어 있어야 함

**Trigger**  
빈방 상태 또는 특정 시간 경과 등 트리거 발생

**Main success scenario**
1. 삭제 조건 감지
2. 사전 안내(타이머) 후 삭제
3. 목록에서 제거

**Extensions**
- 타이머 중 다른 참여자 입장 → 삭제 취소/안내

---

## Use case #22: 오픈스터디 방 화상연결 (Open Room Video)
**Summary**  
스튜디오룸 내 화상 연결 ON/OFF 제어 및 실시간 반영.

**Primary Actor**  
User

**Preconditions**  
로그인 및 방 입장 상태

**Trigger**  
카메라 버튼 클릭

**Main success scenario**
1. 기본값(OFF) 설정
2. 사용자 토글 시 상태 변경 및 실시간 전파
3. ON: 영상 송출, OFF: 닉네임/프로필 표시

**Extensions**
- 장치 인식 실패 → 에러 메시지
- 네트워크 지연 → 연결 불안정 표시

---

## Use case #23: 에러 처리 및 로깅 (Error Handling & Logging)
**Summary**  
시스템 오류 및 예외를 탐지하고 적절히 처리·로깅한다.

**Primary Actor**  
System

**Trigger**  
네트워크/서버/권한 등 예외 발생

**Main success scenario**
1. 에러 탐지
2. 로그 준비 및 기록(중앙 또는 로컬)
3. 사용자에게 적절한 피드백 제공
4. 정상 상태로 복구 시도

**Extensions**
- 로깅 정보 획득 실패 → 최소 정보 저장
- 중앙 로깅 통신 실패 → 로컬 저장/재시도 큐

---

## Use case #24: 그룹스터디 방 입장 (Enter Group Study Room)
**Summary**  
그룹 소속 사용자가 그룹 기반 스터디 방을 생성/참여/관리한다.

**Primary Actor**  
User

**Preconditions**  
로그인 및 그룹 소속

**Trigger**  
그룹 스터디 메뉴 클릭

**Main success scenario**
1. 소속 그룹의 방 목록 표시
2. 생성/참여/멤버 확인 등 수행

**Extensions**
- 권한 오류/접근 실패 → 에러

---

## Use case #25: 그룹스터디 방 생성 및 종료 (Create/End Group Study)
**Summary**  
그룹에 속한 사용자가 방 생성, 설정된 시간 종료 시 방을 자동 종료한다.

**Primary Actor**  
User

**Preconditions**  
로그인 및 그룹 소속

**Trigger**  
그룹 스터디에서 방 만들기 클릭

**Main success scenario**
1. 필수 정보 입력(인원, 분야, 공부시간 등)
2. 성공 시 생성자 입장
3. 공부시간 종료 시 자동 종료 및 퇴장

**Extensions**
- 제목 미입력/필수항목 누락 → 에러

---

## Use case #26: 그룹 생성 (Create Group)
**Summary**  
새 그룹을 생성하고 권한을 설정한다.

**Primary Actor**  
User

**Preconditions**  
로그인 상태

**Trigger**  
그룹 만들기 버튼 클릭

**Main success scenario**
1. 그룹명 입력
2. DB 등록 및 생성자에게 방장 권한 부여

**Extensions**
- 이름 미입력/중복 → 에러

---

## Use case #27: 그룹 삭제 (Delete Group)
**Summary**  
그룹장이 자신이 만든 그룹을 영구 삭제한다(멤버 없어야 함).

**Primary Actor**  
Group Owner

**Preconditions**  
로그인 및 방장 권한, 그룹 내 다른 멤버 없어야 함

**Trigger**  
그룹 삭제 버튼 클릭

**Main success scenario**
1. 삭제 전 확인 절차
2. 최종 동의 시 그룹 영구 삭제

**Extensions**
- 다른 멤버 존재 시 삭제 거부

---

## Use case #28: 그룹 멤버 확인 (Check Group Members)
**Summary**  
그룹의 멤버 목록 조회, 초대 링크 발급, 멤버 추방 등 관리 기능.

**Primary Actor**  
Group Owner / User

**Preconditions**  
로그인 및 그룹 스터디 페이지 접근

**Trigger**  
그룹 멤버 확인 메뉴 클릭

**Main success scenario**
1. 멤버 리스트 표시
2. 초대 링크 복사 및 발급
3. 초대 수락 시 자동 멤버 추가

**Extensions**
- 추방 시 확인 절차
- 초대 발급 오류 → 에러

---

## Use case #29: 그룹스터디 목록 조회 (Group Study List)
**Summary**  
사용자가 소속된 그룹의 스터디 방 목록을 조회한다.

**Primary Actor**  
User

**Preconditions**  
로그인 및 그룹 소속

**Trigger**  
그룹 스터디 목록 메뉴 클릭

**Main success scenario**
1. 자신이 속한 그룹의 스터디 목록만 표시
2. 카드 형태로 핵심 정보 제공

**Extensions**
- 다중 그룹 소속 시 필터링
- 참여 인원 초과 방 표시

---

## Use case #30: 그룹스터디 참여 및 종료 (Join/End Group Study)
**Summary**  
그룹 스터디에 입장하고 설정된 시간 종료 시 자동 퇴장한다.

**Primary Actor**  
User

**Preconditions**  
로그인 및 방 존재

**Trigger**  
참여 버튼 클릭 또는 시간 종료

**Main success scenario**
1. 입장 요청 및 멤버 확인
2. 입장 성공
3. 설정된 시간이 종료되면 자동 퇴장

**Extensions**
- 네트워크 오류 → 참여 실패
- 비멤버 접근 시 차단

---

## Use case #31: 그룹스터디 화상연결 (Group Study Video)
**Summary**  
그룹 스터디 내에서 화상 연결을 제어한다.

**Primary Actor**  
User

**Preconditions**  
로그인 및 그룹 방 입장

**Trigger**  
카메라 버튼 클릭

**Main success scenario**
1. 기본값 OFF
2. 토글 시 실시간 상태 반영
3. ON: 영상 송출 / OFF: 닉네임 표시

**Extensions**
- 장치 인식 오류 → 에러

---

## Use case #32: 참여자 목록 확인 (View Participants)
**Summary**  
현재 스터디방에 접속한 참여자 목록을 확인한다.

**Primary Actor**  
User

**Preconditions**  
방에 입장해 있어야 함

**Trigger**  
참여자 목록 요청

**Main success scenario**
1. 현재 접속 중인 참여자 목록 표시
2. 프로필/상태 메시지 등 함께 표시

**Extensions**
- 목록 로드 실패 → 오류 메시지

---

## Use case #33: 그룹스터디 참여 시간 확인 (Check Participation Time)
**Summary**  
사용자가 스터디룸에 머문 시간을 조회한다.

**Primary Actor**  
User

**Preconditions**  
로그인 및 방 접속

**Trigger**  
참여 시간 확인 요청

**Main success scenario**
1. 입장 시점부터 현재까지 시간 계산
2. 화면에 표시(분 단위 자동 갱신 가능)

**Extensions**
- 시간 계산 오류 → 오류 안내

---

## Use case #34: 공부/휴식 모드 전환 (Study/Break Mode)
**Summary**  
사용자가 공부 또는 휴식 모드로 상태를 전환하여 다른 참여자에게 표시한다.

**Primary Actor**  
User

**Preconditions**  
로그인 및 방 접속

**Trigger**  
모드 토글 또는 타이머에 의한 자동 전환

**Main success scenario**
1. 모드 변경 시 실시간 반영
2. 타이머 연동 시 자동 전환

**Extensions**
- 동기화 문제 발생 시 연결 재시도

---

## Use case #35: 참여자 목록 확인(상세) (Participant List Details)
**Summary**  
참여자의 상세 정보(닉네임, 상태, 참여 시간 등)를 확인한다.

**Primary Actor**  
User

**Preconditions**  
방 접속

**Trigger**  
참여자 목록 열람

**Main success scenario**
1. 각 참여자에 대한 상세 정보 표시

**Extensions**
- 개인정보 표시 제한에 따른 비공개 처리

---

## Use case #36: 참여 시간 표시 (Show Participation Time)
**Summary**  
각 참여자의 참여 시간을 표시한다.

**Primary Actor**  
System / User

**Preconditions**  
방 입장 기록 존재

**Trigger**  
참여자 목록 로드

**Main success scenario**
1. 입장 시각 기반으로 머문 시간 계산 후 표시

**Extensions**
- 동기화 문제로 임시 값 표시

---

## Use case #37: 타이머 설정 및 알림 (Timer & Alerts)
**Summary**  
공부/휴식 타이머 설정과 완료 시 알림 제공.

**Primary Actor**  
User

**Preconditions**  
방 접속

**Trigger**  
타이머 설정 또는 시작

**Main success scenario**
1. 타이머 설정 및 시작
2. 완료 시 알림(음성/팝업) 전송

**Extensions**
- 네트워크 지연 시 재동기화

---

## Use case #38: 공부/휴식 모드 자동화 (Auto Mode via Timer)
**Summary**  
타이머에 따라 공부/휴식 모드를 자동 전환한다.

**Primary Actor**  
System

**Preconditions**  
타이머 설정

**Trigger**  
타이머 만료

**Main success scenario**
1. 모드 자동 전환 및 실시간 반영

**Extensions**
- 재동기화 실패 시 사용자 수동 전환 필요

---

## Use case #39: 이메일 인증(가입/변경/비밀번호 찾기) - (Email Auth) *(partial, see #44)*  
**Summary**  
이메일 기반 인증이 필요한 흐름에서 코드 또는 링크를 발송하여 소유권을 검증한다.

(세부 흐름은 #44 이메일 인증에 상세 기술)

---

## Use case #40: 체크 리스트 생성 (Create Checklist)
**Summary**  
특정 날짜에 체크리스트를 생성해 개인 목표를 설정한다.

**Primary Actor**  
User

**Preconditions**  
로그인 및 체크리스트 관리 페이지 접근

**Trigger**  
생성 버튼 클릭

**Main success scenario**
1. 날짜 선택 후 생성
2. 내용 작성 및 저장 → 달력 반영

**Extensions**
- 내용 미입력 → 저장 거부

---

## Use case #41: 체크 리스트 수정 (Edit Checklist)
**Summary**  
작성된 체크리스트를 수정한다.

**Primary Actor**  
User

**Preconditions**  
수정할 체크리스트 존재

**Trigger**  
수정 버튼 클릭

**Main success scenario**
1. 날짜 선택 및 수정 창 오픈
2. 수정 후 저장 → DB 반영

**Extensions**
- 수정할 체크리스트 없음 → 안내
- 수정 내용 미입력 → 안내

---

## Use case #42: 체크 리스트 조회 (View Checklist)
**Summary**  
작성된 체크리스트를 조회한다.

**Primary Actor**  
User

**Preconditions**  
체크리스트 존재

**Trigger**  
조회 요청

**Main success scenario**
1. 해당 날짜의 체크리스트 표시

**Extensions**
- 조회 실패 → 에러 안내

---

## Use case #43: 체크 리스트 삭제 (Delete Checklist)
**Summary**  
선택한 체크리스트를 삭제한다.

**Primary Actor**  
User

**Preconditions**  
삭제할 체크리스트 선택

**Trigger**  
삭제 버튼 클릭

**Main success scenario**
1. 삭제 대상 선택
2. 최종 확인 다이얼로그
3. 삭제 시 DB에서 제거 및 목록 갱신

**Extensions**
- 삭제할 항목 없음 → 버튼 비활성화
- 삭제 취소 → 변경 없음

---

## Use case #44: 이메일 인증 (Email Verification)
**Summary**  
입력한 이메일 주소의 유효성 및 소유권을 확인하기 위해 인증 코드 또는 링크를 발송하고 확인한다.

**Primary Actor**  
User

**Preconditions**
- 인증할 이메일 주소 입력
- 시스템이 해당 주소로 메일 발송 가능 상태

**Trigger**
- 회원가입, 이메일 변경, 비밀번호 찾기 등 이메일 인증 필요 시

**Main success scenario**
1. 사용자가 인증 요청 이메일 주소 입력
2. 시스템이 유효기간이 설정된 인증 코드 발송
3. 사용자에게 코드 입력 필드 제공
4. 사용자가 이메일에서 코드 확인 후 입력 및 확인 클릭
5. 시스템이 코드 일치 검증
6. 검증 성공 시 "이메일 인증 완료" 메시지 표시

**Extensions**
- 이메일 발송 실패 → 발송 실패 메시지 표시(주소 확인 요청).
- 인증 코드 불일치 → 오류 메시지 표시.
- 링크/코드 만료 → 만료 안내 및 재발송 옵션 제공.





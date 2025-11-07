# 5. State Machine Diagram

![스테이트 다이어그램](./images/statemachine_diagram.png)

---



## 5.1 초기 진입 및 인증 흐름



&nbsp;처음 시작하면 초기 상태에서 시작하여 사용자는 회원가입 또는 로그인을 선택할 수 있다. Register 버튼을 클릭하면 Register 상태로 전환되어 회원가입 화면이 표시되고, Login 버튼을 클릭하면 Login 상태로 전환되어 로그인 화면이 표시된다. 로그인에 성공하면 MainPage 상태로 진입하여 애플리케이션의 핵심 기능들에 접근할 수 있게 된다.



---



## 5.2 MainPage



&nbsp;MainPage 상태는 애플리케이션의 중심 허브로서 4개의 주요 기능 영역으로 분기된다. 사용자는 MyPage 버튼, OpenStudy 버튼, Group 버튼, CheckList 버튼 중 하나를 클릭하여 원하는 기능으로 진입할 수 있다.



---



### 5.2.1 MyPage



&nbsp;MyPage 버튼을 클릭하면 MyPage 상태로 전환되어 개인 프로필 관리 화면이 표시된다. MyPage 내에서는 4개의 하위 기능을 수행할 수 있는데, UploadProfilePicture 버튼을 클릭하면 프로필 사진을 업로드할 수 있는 UploadProfilePicture 상태가 되고, ShowUserInfo 버튼을 클릭하면 사용자 정보를 조회하는 ShowUserInfo 상태가 된다. SelectStudyField 버튼을 클릭하면 관심 스터디 분야를 선택하는 SelectStudyField 상태로, WriteIntroduction 버튼을 클릭하면 자기소개를 작성하는 WriteIntroduction 상태로 전환된다.

&nbsp;MyPage에서 AccountSettings 버튼을 클릭하면 AccountSettings 상태로 전환되어 계정 설정 화면으로 진입한다. AccountSettings 상태에서는 ChangeEmail 버튼을 클릭하여 ChangeEmail 상태에서 이메일을 변경하거나, ChangePassword 버튼을 클릭하여 ChangePassword 상태에서 비밀번호를 변경할 수 있다. DeleteAccount 버튼을 클릭하면 DeleteAccount 상태로 전환되어 계정을 탈퇴할 수 있으며, SetNotifications 버튼을 클릭하면 SetNotifications 상태에서 알림 설정을 조정할 수 있다.



---



### 5.2.2 OpenStudy



&nbsp;MainPage에서 OpenStudy 버튼을 클릭하면 OpenStudy 상태로 전환되어 오픈스터디  화면이 표시된다. 이 상태에서는 먼저 ViewOpenStudyList 상태로 진입하여 현재 개설된 오픈 스터디 목록을 조회할 수 있다. CreateOpenStudy 버튼을 클릭하면 CreateOpenStudy 상태로 전환되어 새로운 오픈 스터디를 생성할 수 있고, 기존 스터디 목록에서 JoinOpenStudy 버튼을 클릭하면 JoinOpenStudy 상태를 거쳐 해당 스터디에 참여하게 된다. 스터디 참여가 완료되면 OpenStudyRoom 상태로 전환되어 실제 스터디 세션이 시작된다.



---



### 5.2.3 Group


&nbsp;Group 버튼을 클릭하면 Group 상태로 전환되어 그룹 관리 화면이 표시된다. 먼저 ViewGroupList 상태에서 자신이 속한 그룹 목록을 조회할 수 있으며, CreateGroup 버튼을 클릭하면 CreateGroup 상태로 전환되어 새로운 그룹을 생성할 수 있다. 기존 그룹에 대해 DeleteGroup 버튼을 클릭하면 DeleteGroup 상태로 전환되어 해당 그룹을 삭제할 수 있다.



---



### 5.2.4 CheckList



&nbsp;CheckList 버튼을 클릭하면 CheckList 화면이 표시된다. 먼저 날짜를 선택한 후 ViewCheckList 상태에서 해당 날짜의 체크리스트를 조회할 수 있다. CreateCheckList 버튼을 클릭하면 CreateCheckList 상태로 전환되어 새로운 체크리스트 항목을 생성할 수 있고, EditCheckList 버튼을 클릭하면 EditCheckList 상태에서 기존 항목을 수정할 수 있다. DeleteCheckList 버튼을 클릭하면 DeleteCheckList 상태로 전환되어 체크리스트 항목을 삭제할 수 있다.



---



## 5.3 GroupStudy



&nbsp;MainPage의 또 다른 분기로 GroupStudy 기능이 있다. 이 기능은 그룹 멤버들과 함께 진행하는 스터디를 관리한다. GroupStudy 상태로 진입하면 먼저 ViewGroupStudyList 상태에서 그룹 스터디 목록을 조회할 수 있다. SendIRL 버튼을 클릭하면 SendIRL 상태로 전환되어 그룹 멤버들에게 스터디 참여 초대를 보낼 수 있다. CreateGroupStudy 버튼을 클릭하면 CreateGroupStudy 상태에서 새로운 그룹 스터디를 생성할 수 있고, JoinGroupStudy 버튼을 클릭하면 JoinGroupStudy 상태를 거쳐 그룹 스터디에 참여하게 된다. RemoveGroupMember 버튼을 클릭하면 RemoveGroupMember 상태로 전환되어 그룹 멤버를 제거할 수 있다. 그룹 스터디 참여가 완료되면 GroupStudyRoom 상태로 전환되어 실제 그룹 스터디 세션이 시작된다.



---



## 5.4 Study Room



---



### 5.4.1 OpenStudyRoom



&nbsp;OpenStudyRoom 상태로 진입하면 실제 스터디 세션 화면이 표시된다. 이 상태는 여러 하위 기능으로 구성되어 있는데, OpenStudyRoom에 입장하면 JoinVideoSession 과 CheckParticipationTime 상태로 전환되어 화상연결에 참여할 수 있고 자신의 참여 시간을 확인할 수 있다. Participant List 버튼을 클릭하면 ViewParticipantList 상태에서 현재 세션에 참여 중인 사용자 목록을 확인할 수 있고, Status Message 버튼을 클릭하면 SetStatusMessage 상태로 전환되어 자신의 상태 메시지를 설정할 수 있다.

&nbsp;또다른 핵심 기능은 StudyCycleRepeatTimer로, 이는 공부와 휴식을 반복하는 타이머 시스템이다. Set StudyTime, Set BreakTime 버튼을 클릭하면 SetStudyTime, SetBreakTime 상태로 전환되어 공부시간과 휴식시간을 설정할 수 있고, 두 개의 설정이 모두 완료되면 On 버튼을 클릭할 때 Study 상태로 진입하여 타이머가 작동한다. Study Timeout이 발생하면 자동으로 Break 상태로 전환되며, Break Timeout이 발생하면 다시 Study 상태로 돌아가는 순환 구조를 가진다. Off 버튼을 클릭하면 타이머가 종료되어 종료 상태로 전환된다.

&nbsp;추가로 SetStudyBreakMode 기능이 있어, Break 버튼을 클릭하면 Break 모드로, Study 버튼을 클릭하면 Study 모드로 수동 전환할 수 있다. 스터디 세션을 완전히 종료하려면 Leave 버튼을 클릭하여 OpenStudyRoom을 나가고 종료 상태에 도달한다.



---



### 5.4.2 GroupStudyRoom


&nbsp;GroupStudyRoom 상태는 OpenStudyRoom과 동일한 구조와 기능을 가지고 있다. JoinVideoSession, ViewParticipantList, CheckParticipationTime, SetStatusMessage 등의 기능이 동일하게 제공되며, StudyCycleRepeatTimer와 SetStudyBreakMode 역시 같은 방식으로 작동한다. 차이점은 그룹 멤버들과 함께 진행하는 세션이고 GroupStudy Timer가 Timeout되면 자동으로 GroupStudyRoom을 나가고 종료 상태에 도달한다.


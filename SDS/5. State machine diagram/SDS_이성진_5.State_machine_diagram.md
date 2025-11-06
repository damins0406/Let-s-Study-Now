```mermaid
stateDiagram-v2
    [*] --> Initial

    %% 5.1 초기 진입 및 인증 흐름
    state Initial {
        [*] --> Start
        Start --> Register : Click Register
        Start --> Login : Click Login
        Register --> Login : Registration Complete
        Login --> MainPage : Login Success
    }

    %% 5.2 MainPage
    state MainPage {
        [*] --> Idle
        Idle --> MyPage : Click MyPage
        Idle --> OpenStudy : Click OpenStudy
        Idle --> Group : Click Group
        Idle --> CheckList : Click CheckList
        Idle --> GroupStudy : Click GroupStudy
    }

    %% MyPage
    state MyPage {
        [*] --> ShowUserInfo
        ShowUserInfo --> UploadProfilePicture : Upload Profile
        ShowUserInfo --> SelectStudyField : Select Study Field
        ShowUserInfo --> WriteIntroduction : Write Introduction
        ShowUserInfo --> AccountSettings : Account Settings

        state AccountSettings {
            [*] --> Default
            Default --> ChangeEmail : Change Email
            Default --> ChangePassword : Change Password
            Default --> DeleteAccount : Delete Account
            Default --> SetNotifications : Set Notifications
            ChangeEmail --> Default
            ChangePassword --> Default
            SetNotifications --> Default
        }

        UploadProfilePicture --> ShowUserInfo
        SelectStudyField --> ShowUserInfo
        WriteIntroduction --> ShowUserInfo
        AccountSettings --> ShowUserInfo
        note right of MyPage : (Return to MainPage)
    }

    %% OpenStudy
    state OpenStudy {
        [*] --> ViewOpenStudyList
        ViewOpenStudyList --> CreateOpenStudy : Create
        ViewOpenStudyList --> JoinOpenStudy : Join
        CreateOpenStudy --> ViewOpenStudyList
        JoinOpenStudy --> OpenStudyRoom
        note right of OpenStudy : (Return to MainPage)
    }

    %% Group
    state Group {
        [*] --> ViewGroupList
        ViewGroupList --> CreateGroup : Create
        ViewGroupList --> DeleteGroup : Delete
        CreateGroup --> ViewGroupList
        DeleteGroup --> ViewGroupList
        note right of Group : (Return to MainPage)
    }

    %% CheckList
    state CheckList {
        [*] --> ViewCheckList
        ViewCheckList --> CreateCheckList : Create
        ViewCheckList --> EditCheckList : Edit
        ViewCheckList --> DeleteCheckList : Delete
        CreateCheckList --> ViewCheckList
        EditCheckList --> ViewCheckList
        DeleteCheckList --> ViewCheckList
        note right of CheckList : (Return to MainPage)
    }

    %% GroupStudy
    state GroupStudy {
        [*] --> ViewGroupStudyList
        ViewGroupStudyList --> SendIRL : Send Invite
        ViewGroupStudyList --> CreateGroupStudy : Create
        ViewGroupStudyList --> JoinGroupStudy : Join
        ViewGroupStudyList --> RemoveGroupMember : Remove Member

        CreateGroupStudy --> ViewGroupStudyList
        SendIRL --> ViewGroupStudyList
        RemoveGroupMember --> ViewGroupStudyList
        JoinGroupStudy --> GroupStudyRoom
        note right of GroupStudy : (Return to MainPage)
    }

    %% OpenStudyRoom
    state OpenStudyRoom {
        [*] --> JoinVideoSession
        JoinVideoSession --> CheckParticipationTime
        CheckParticipationTime --> ViewParticipantList : View Participants
        ViewParticipantList --> SetStatusMessage : Set Status
        SetStatusMessage --> StudyCycleRepeatTimer

        state StudyCycleRepeatTimer {
            [*] --> Idle
            Idle --> SetStudyTime : Set Study
            SetStudyTime --> SetBreakTime : Set Break
            SetBreakTime --> Ready
            Ready --> Study : Start
            Study --> Break : Study Timeout
            Break --> Study : Break Timeout
            Study --> Off : Stop
            Break --> Off : Stop
            Off --> [*]
        }

        note right of OpenStudyRoom : Leave = End Session
    }

    %% GroupStudyRoom
    state GroupStudyRoom {
        [*] --> JoinVideoSession
        JoinVideoSession --> CheckParticipationTime
        CheckParticipationTime --> ViewParticipantList
        ViewParticipantList --> SetStatusMessage
        SetStatusMessage --> GroupStudyTimer

        state GroupStudyTimer {
            [*] --> Study
            Study --> Break : Timeout
            Break --> Study : Timeout
            Study --> [*] : Session End
        }

        note right of GroupStudyRoom : Timeout = Auto Exit
    }

    %% 메인 흐름 연결
    Initial --> MainPage : Login Success
    MainPage --> MyPage
    MainPage --> OpenStudy
    MainPage --> Group
    MainPage --> CheckList
    MainPage --> GroupStudy
    OpenStudy --> OpenStudyRoom
    GroupStudy --> GroupStudyRoom

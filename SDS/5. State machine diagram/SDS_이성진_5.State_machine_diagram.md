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

    %% 5.2.1 MyPage
    state MyPage {
        [*] --> ShowUserInfo
        ShowUserInfo --> UploadProfilePicture : Click UploadProfilePicture
        ShowUserInfo --> SelectStudyField : Click SelectStudyField
        ShowUserInfo --> WriteIntroduction : Click WriteIntroduction
        ShowUserInfo --> AccountSettings : Click AccountSettings

        state AccountSettings {
            [*] --> Default
            Default --> ChangeEmail : Click ChangeEmail
            Default --> ChangePassword : Click ChangePassword
            Default --> DeleteAccount : Click DeleteAccount
            Default --> SetNotifications : Click SetNotifications
            ChangeEmail --> Default : Done
            ChangePassword --> Default : Done
            DeleteAccount --> [*] : Account Deleted
            SetNotifications --> Default : Saved
        }

        UploadProfilePicture --> ShowUserInfo : Done
        SelectStudyField --> ShowUserInfo : Done
        WriteIntroduction --> ShowUserInfo : Done
        AccountSettings --> ShowUserInfo : Back
        ShowUserInfo --> MainPage : Back to Main
    }

    %% 5.2.2 OpenStudy
    state OpenStudy {
        [*] --> ViewOpenStudyList
        ViewOpenStudyList --> CreateOpenStudy : Click CreateOpenStudy
        ViewOpenStudyList --> JoinOpenStudy : Click JoinOpenStudy
        CreateOpenStudy --> ViewOpenStudyList : Created
        JoinOpenStudy --> OpenStudyRoom : Joined
        OpenStudyRoom --> [*] : Leave
    }

    %% 5.2.3 Group
    state Group {
        [*] --> ViewGroupList
        ViewGroupList --> CreateGroup : Click CreateGroup
        ViewGroupList --> DeleteGroup : Click DeleteGroup
        CreateGroup --> ViewGroupList : Created
        DeleteGroup --> ViewGroupList : Deleted
        ViewGroupList --> MainPage : Back
    }

    %% 5.2.4 CheckList
    state CheckList {
        [*] --> ViewCheckList
        ViewCheckList --> CreateCheckList : Click Create
        ViewCheckList --> EditCheckList : Click Edit
        ViewCheckList --> DeleteCheckList : Click Delete
        CreateCheckList --> ViewCheckList : Done
        EditCheckList --> ViewCheckList : Done
        DeleteCheckList --> ViewCheckList : Done
        ViewCheckList --> MainPage : Back
    }

    %% 5.3 GroupStudy
    state GroupStudy {
        [*] --> ViewGroupStudyList
        ViewGroupStudyList --> SendIRL : Click SendIRL
        ViewGroupStudyList --> CreateGroupStudy : Click CreateGroupStudy
        ViewGroupStudyList --> JoinGroupStudy : Click JoinGroupStudy
        ViewGroupStudyList --> RemoveGroupMember : Click RemoveGroupMember

        CreateGroupStudy --> ViewGroupStudyList : Created
        SendIRL --> ViewGroupStudyList : Sent
        RemoveGroupMember --> ViewGroupStudyList : Removed
        JoinGroupStudy --> GroupStudyRoom : Joined
        GroupStudyRoom --> [*] : Session End
    }

    %% 5.4 Study Room
    state OpenStudyRoom {
        [*] --> JoinVideoSession
        JoinVideoSession --> CheckParticipationTime
        CheckParticipationTime --> ViewParticipantList : Click Participant List
        ViewParticipantList --> SetStatusMessage : Click Status Message
        SetStatusMessage --> StudyCycleRepeatTimer : Set Complete

        state StudyCycleRepeatTimer {
            [*] --> Idle
            Idle --> SetStudyTime : Click SetStudyTime
            SetStudyTime --> SetBreakTime : Done
            SetBreakTime --> Ready : Done
            Ready --> Study : Click On
            Study --> Break : Study Timeout
            Break --> Study : Break Timeout
            Study --> Off : Click Off
            Break --> Off : Click Off
            Off --> [*]
        }

        StudyCycleRepeatTimer --> SetStudyBreakMode : Manual Switch
        SetStudyBreakMode --> StudyCycleRepeatTimer : Back
        OpenStudyRoom --> [*] : Click Leave
    }

    %% 5.4.2 GroupStudyRoom
    state GroupStudyRoom {
        [*] --> JoinVideoSession
        JoinVideoSession --> CheckParticipationTime
        CheckParticipationTime --> ViewParticipantList : Click Participant List
        ViewParticipantList --> SetStatusMessage : Click Status Message
        SetStatusMessage --> GroupStudyTimer : Set Complete

        state GroupStudyTimer {
            [*] --> Study
            Study --> Break : Timeout
            Break --> Study : Timeout
            Study --> [*] : Session End
        }

        GroupStudyRoom --> [*] : Timeout Exit
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

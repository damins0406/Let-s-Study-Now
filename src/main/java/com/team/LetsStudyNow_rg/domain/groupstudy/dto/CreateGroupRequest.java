package com.team.LetsStudyNow_rg.domain.groupstudy.dto;

public class CreateGroupRequest {

    private String groupName;  // 그룹 이름
    private Long leaderId;     // 그룹 생성자 ID

    // 기본 생성자
    public CreateGroupRequest() {
    }

    // 생성자
    public CreateGroupRequest(String groupName, Long leaderId) {
        this.groupName = groupName;
        this.leaderId = leaderId;
    }

    // Getter - 값 가져오기
    public String getGroupName() {
        return groupName;
    }

    public Long getLeaderId() {
        return leaderId;
    }

    // Setter - 값 설정하기
    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }

    public void setLeaderId(Long leaderId) {
        this.leaderId = leaderId;
    }
}

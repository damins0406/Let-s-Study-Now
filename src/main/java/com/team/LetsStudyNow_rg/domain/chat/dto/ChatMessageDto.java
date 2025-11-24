package com.team.LetsStudyNow_rg.domain.chat.dto;

import com.team.LetsStudyNow_rg.domain.chat.enums.MessageType;
import com.team.LetsStudyNow_rg.domain.chat.enums.ChatRoomType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatMessageDto {

    private MessageType type; // 메시지 타입
    private ChatRoomType roomType; // 스터디룸 (오픈, 그룹)
    private Long roomId;      // 방 번호
    private String sender;    // 보낸 사람 (닉네임)
    private String message;   // 내용 (텍스트 or 이미지 URL)

}
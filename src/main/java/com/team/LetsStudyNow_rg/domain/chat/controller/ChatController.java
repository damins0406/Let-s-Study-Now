package com.team.LetsStudyNow_rg.domain.chat.controller;

import com.team.LetsStudyNow_rg.domain.chat.dto.ChatMessageDto;
import com.team.LetsStudyNow_rg.domain.chat.entity.ChatMessage;
import com.team.LetsStudyNow_rg.domain.chat.enums.ChatRoomType;
import com.team.LetsStudyNow_rg.domain.chat.enums.MessageType;
import com.team.LetsStudyNow_rg.domain.chat.repository.ChatRepository;
import com.team.LetsStudyNow_rg.domain.chat.service.ChatService;
import com.team.LetsStudyNow_rg.global.s3.S3Service;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessageSendingOperations messagingTemplate;
    private final ChatService chatService;
    private final S3Service s3Service;

    // 메시지 전송 처리 (클라이언트: /pub/chat/message)
    @MessageMapping("/chat/message")
    public void message(ChatMessageDto messageDto) {

        chatService.saveMessage(messageDto);

        // /sub/chat/... 구독 중인 클라이언트들에게 메시지 전송
        String destination = "/sub/chat/" + messageDto.getRoomType().name().toLowerCase() + "/" + messageDto.getRoomId();
        messagingTemplate.convertAndSend(destination, messageDto);
    }

    // 이전 채팅 가져옴 (크기: 20)
    @Operation(summary = "채팅 내역 조회", description = "특정 방의 이전 채팅 내역을 최신순으로 조회합니다.")
    @GetMapping("/api/chat/room/{roomId}")
    public ResponseEntity<List<ChatMessage>> getChatHistory(
            @PathVariable Long roomId,
            @RequestParam ChatRoomType roomType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {

        // 리스트로 변환 (최신순)
        List<ChatMessage> chatList = chatService.getChatHistory(roomId, roomType, page, size);

        return ResponseEntity.ok(chatList);
    }

    @PostMapping(value = "/api/chat/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadChatImage(
            @RequestPart("file") MultipartFile file
    ) {
        String imageUrl = s3Service.uploadFile(file, "chat");

        return ResponseEntity.ok(imageUrl);
    }
}


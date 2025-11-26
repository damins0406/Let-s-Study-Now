package com.team.LetsStudyNow_rg.domain.chat.service;

import com.team.LetsStudyNow_rg.domain.chat.dto.ChatMessageDto;
import com.team.LetsStudyNow_rg.domain.chat.entity.ChatMessage;
import com.team.LetsStudyNow_rg.domain.chat.enums.ChatRoomType;
import com.team.LetsStudyNow_rg.domain.chat.enums.MessageType;
import com.team.LetsStudyNow_rg.domain.chat.repository.ChatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository chatRepository;

    @Transactional
    public void saveMessage(ChatMessageDto messageDto) {

        if (MessageType.ENTER.equals(messageDto.getType())) {
            messageDto.setMessage(messageDto.getSender() + "님이 입장하셨습니다.");
        }

        ChatMessage chatEntity = ChatMessage.builder()
                .roomType(messageDto.getRoomType())
                .roomId(messageDto.getRoomId())
                .sender(messageDto.getSender())
                .message(messageDto.getMessage())
                .type(messageDto.getType())
                .build();

        chatRepository.save(chatEntity);
    }

    @Transactional(readOnly = true)
    public List<ChatMessage> getChatHistory(Long roomId, ChatRoomType roomType, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "sentAt"));

        Slice<ChatMessage> chatSlice = chatRepository.findByRoomIdAndRoomTypeOrderBySentAtDesc(roomId, roomType, pageable);

        return chatSlice.getContent();
    }
}

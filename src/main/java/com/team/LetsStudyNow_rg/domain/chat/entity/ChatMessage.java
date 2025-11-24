package com.team.LetsStudyNow_rg.domain.chat.entitiy;

import com.team.LetsStudyNow_rg.domain.chat.enums.MessageType;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long roomId;      // 방 번호

    @Column(nullable = false)
    private String sender;    // 보낸 사람

    @Column(columnDefinition = "TEXT")
    private String message;   // 메시지 내용

    @Enumerated(EnumType.STRING)
    private MessageType type;

    @CreatedDate
    private LocalDateTime sentAt;

    @Builder
    public ChatMessage(Long roomId, String sender, String message, MessageType type) {
        this.roomId = roomId;
        this.sender = sender;
        this.message = message;
        this.type = type;
    }
}

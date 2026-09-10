package com.pms.backend.notification.dto;

import com.pms.backend.notification.entity.NotificationType;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class NotificationDto {
    private Long id;
    private Long userId;
    private String title;
    private String message;
    private NotificationType type;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private Long relatedEntityId;
}

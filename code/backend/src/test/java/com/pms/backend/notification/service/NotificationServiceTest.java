package com.pms.backend.notification.service;

import com.pms.backend.notification.dto.NotificationDto;
import com.pms.backend.notification.entity.Notification;
import com.pms.backend.notification.entity.NotificationType;
import com.pms.backend.notification.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationService Unit Tests")
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private NotificationService notificationService;

    private Notification sampleNotification;

    @BeforeEach
    void setUp() {
        sampleNotification = Notification.builder()
                .id(100L)
                .userId(5L)
                .title("New Appointment")
                .message("You have a scheduled checkup tomorrow")
                .type(NotificationType.APPOINTMENT)
                .isRead(false)
                .relatedEntityId(200L)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Nested
    @DisplayName("createNotification()")
    class CreateNotificationTests {

        @Test
        @DisplayName("Happy path: saves notification and broadcasts via WebSocket topic")
        void createNotification_Success() {
            when(notificationRepository.save(any(Notification.class))).thenAnswer(inv -> {
                Notification n = inv.getArgument(0);
                n.setId(100L);
                return n;
            });

            NotificationDto result = notificationService.createNotification(
                    5L,
                    "New Appointment",
                    "You have a scheduled checkup tomorrow",
                    NotificationType.APPOINTMENT,
                    200L
            );

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(100L);
            assertThat(result.getUserId()).isEqualTo(5L);
            assertThat(result.getTitle()).isEqualTo("New Appointment");
            assertThat(result.getType()).isEqualTo(NotificationType.APPOINTMENT);

            verify(notificationRepository).save(any(Notification.class));
            verify(messagingTemplate).convertAndSend(eq("/topic/user-5"), eq(result));
        }
    }

    @Nested
    @DisplayName("Queries: getUserNotifications() & getUnreadCount()")
    class QueryTests {

        @Test
        @DisplayName("getUserNotifications returns mapped DTO list ordered by creation")
        void getUserNotifications_Success() {
            when(notificationRepository.findByUserIdOrderByCreatedAtDesc(5L))
                    .thenReturn(List.of(sampleNotification));

            List<NotificationDto> results = notificationService.getUserNotifications(5L);

            assertThat(results).hasSize(1);
            assertThat(results.get(0).getId()).isEqualTo(100L);
            assertThat(results.get(0).getTitle()).isEqualTo("New Appointment");
        }

        @Test
        @DisplayName("getUnreadCount returns correct unread count")
        void getUnreadCount_Success() {
            when(notificationRepository.countByUserIdAndIsReadFalse(5L)).thenReturn(3L);

            long count = notificationService.getUnreadCount(5L);

            assertThat(count).isEqualTo(3L);
        }
    }

    @Nested
    @DisplayName("markAsRead() & markAllAsRead()")
    class MarkAsReadTests {

        @Test
        @DisplayName("markAsRead: sets isRead=true and saves when userId matches")
        void markAsRead_MatchingUser_Succeeds() {
            when(notificationRepository.findById(100L)).thenReturn(Optional.of(sampleNotification));

            notificationService.markAsRead(100L, 5L);

            assertThat(sampleNotification.getIsRead()).isTrue();
            verify(notificationRepository).save(sampleNotification);
        }

        @Test
        @DisplayName("markAsRead: does not mark or save when notification belongs to different user")
        void markAsRead_MismatchedUser_NoOp() {
            when(notificationRepository.findById(100L)).thenReturn(Optional.of(sampleNotification));

            notificationService.markAsRead(100L, 999L); // wrong user

            assertThat(sampleNotification.getIsRead()).isFalse();
            verify(notificationRepository, never()).save(any());
        }

        @Test
        @DisplayName("markAsRead: does nothing when notification does not exist")
        void markAsRead_NotFound_NoOp() {
            when(notificationRepository.findById(999L)).thenReturn(Optional.empty());

            notificationService.markAsRead(999L, 5L);

            verify(notificationRepository, never()).save(any());
        }

        @Test
        @DisplayName("markAllAsRead: marks all unread notifications for user as read")
        void markAllAsRead_Success() {
            Notification n1 = Notification.builder().id(1L).userId(5L).isRead(false).build();
            Notification n2 = Notification.builder().id(2L).userId(5L).isRead(false).build();

            when(notificationRepository.findByUserIdAndIsReadFalse(5L)).thenReturn(List.of(n1, n2));

            notificationService.markAllAsRead(5L);

            assertThat(n1.getIsRead()).isTrue();
            assertThat(n2.getIsRead()).isTrue();

            @SuppressWarnings("unchecked")
            ArgumentCaptor<List<Notification>> captor = ArgumentCaptor.forClass(List.class);
            verify(notificationRepository).saveAll(captor.capture());
            assertThat(captor.getValue()).containsExactly(n1, n2);
        }
    }
}

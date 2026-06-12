export enum NotificationType {
  LIKE = "like",
  COMMENT = "comment",
  FOLLOW = "follow",
  MENTION = "mention",
}

export interface CreateNotificationDto {
  notifierId: number;
  receiverId: number;
  notificationType: NotificationType;
  entityId: number;
}

export interface NotificationResponseDto {
  id: number;
  notifier_id: number;
  receiver_id: number;
  notification_type: NotificationType;
  entity_id: number;
  is_read: boolean;
  createdAt: Date;
}
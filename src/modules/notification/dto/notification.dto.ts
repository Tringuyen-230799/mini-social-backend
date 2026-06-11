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
  notifierId: number;
  receiverId: number;
  notificationType: NotificationType;
  entityId: number;
  isRead: boolean;
  createdAt: Date;
}
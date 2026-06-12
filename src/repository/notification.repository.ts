import { Pool, PoolClient } from "pg";
import pool from "~/config/database";
import {
  CreateNotificationDto,
  NotificationResponseDto,
} from "~/modules/notification/dto/notification.dto";

export class NotificationRepository {
  async createNotifcation(
    payload: CreateNotificationDto,
    poolClient: PoolClient | Pool,
  ) {
    const db = poolClient ?? pool;

    const { entityId, notificationType, notifierId, receiverId } = payload;

    const queryInsert =
      "INSERT INTO notifications (notifier_id, receiver_id, notification_type, entity_id, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *";

    const {
      rows: [notication],
    } = await db.query<NotificationResponseDto>(queryInsert, [
      notifierId,
      receiverId,
      notificationType,
      entityId,
    ]);

    return notication;
  }
}

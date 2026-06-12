import { NotificationRepository } from "~/repository/notification.repository";
import { CreateNotificationDto } from "./dto/notification.dto";
import { Pool, PoolClient } from "pg";
import { BadRequestException } from "~/shared/utils/error-exception";

export class NotificationService {
  private notificationRepository: NotificationRepository;

  constructor() {
    this.notificationRepository = new NotificationRepository();
  }

  async createNotifaction(
    payload: CreateNotificationDto,
    tx?: PoolClient | Pool,
  ) {
    const notification = await this.notificationRepository.createNotifcation(
      payload,
      tx!,
    );

    if (!notification) {
      throw new BadRequestException("Error in create notification record");
    }

    return notification;
  }
}

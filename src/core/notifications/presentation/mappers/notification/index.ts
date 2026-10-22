import type { Notification } from "../../../domain/entities";
import type { ListNotificationResponseDto } from "../../dto";

export class NotificationMapper {
    public static toResponse(notifications: Notification[]): ListNotificationResponseDto[] {
        return notifications.map((notification) => ({
            id: notification.id,
            code: notification.code,
            channels: [...notification.channels],
            locale: notification.locale,
            payload: notification.payload,
            status: notification.status,
            attempts: notification.attempts,
            sentAt: notification.sentAt,
            readAt: notification.readAt,
            createdAt: notification.createdAt,
            updatedAt: notification.updatedAt,
        }));
    }
}

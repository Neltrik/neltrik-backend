import { type Notification as PrismaNotification, type Prisma } from "@prisma/client";

import { Notification } from "../../../domain/entities";
import type { NotificationChannel, NotificationPayload } from "../../../domain/types";

export class NotificationMapper {
    public static toPersistence(notification: Notification) {
        return {
            id: notification.id,
            tenantId: notification.tenantId,
            recipientId: notification.recipientId,
            recipientEmail: notification.recipientEmail,
            code: notification.code,
            status: notification.status,
            channels: notification.channels as string[],
            payload: notification.payload as Prisma.InputJsonValue,
            locale: notification.locale,
            attempts: notification.attempts,
            lastError: notification.lastError,
            sentAt: notification.sentAt,
            readAt: notification.readAt,
            createdAt: notification.createdAt,
            updatedAt: notification.updatedAt,
        };
    }

    public static toDomain(notification: PrismaNotification): Notification {
        return Notification.restore({
            id: notification.id,
            tenantId: notification.tenantId,
            recipientId: notification.recipientId,
            recipientEmail: notification.recipientEmail,
            code: notification.code,
            status: notification.status,
            channels: notification.channels as NotificationChannel[],
            payload: notification.payload as NotificationPayload,
            locale: notification.locale,
            attempts: notification.attempts,
            lastError: notification.lastError,
            sentAt: notification.sentAt,
            readAt: notification.readAt,
            createdAt: notification.createdAt,
            updatedAt: notification.updatedAt,
        });
    }
}

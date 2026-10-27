import type { NotificationCategory, NotificationChannel } from "../../../../../domain/types";

export type CreateNotificationPreferenceInput = {
    actorTenantId: string;
    actorUserId: string;
    channel: NotificationChannel;
    category: NotificationCategory;
};

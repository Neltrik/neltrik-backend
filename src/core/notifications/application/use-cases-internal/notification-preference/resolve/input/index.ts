import type { NotificationCategory, NotificationChannel } from "../../../../../domain/types";

export type ResolveNotificationPreferenceInput = {
    ownerId: string;
    channel: NotificationChannel;
    category: NotificationCategory;
};

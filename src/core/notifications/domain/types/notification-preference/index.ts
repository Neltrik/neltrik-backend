import { type NotificationChannel } from "../notification";

export const NOTIFICATION_CATEGORY = {
    TRANSACTIONAL: "TRANSACTIONAL",
    MARKETING: "MARKETING",
} as const;
export type NotificationCategory = (typeof NOTIFICATION_CATEGORY)[keyof typeof NOTIFICATION_CATEGORY];
export const NOTIFICATION_CATEGORIES: readonly NotificationCategory[] = Object.values(NOTIFICATION_CATEGORY);

export type NotificationPreferenceProps = {
    id: string;
    tenantId: string;
    ownerId: string;
    channel: NotificationChannel;
    category: NotificationCategory;
    enabled: boolean;
    createdAt: Date;
    updatedAt: Date;
};

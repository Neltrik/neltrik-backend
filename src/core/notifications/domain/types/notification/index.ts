export const NOTIFICATION_STATUS = {
    PENDING: "PENDING",
    SENT: "SENT",
    FAILED: "FAILED",
} as const;
export type NotificationStatus = (typeof NOTIFICATION_STATUS)[keyof typeof NOTIFICATION_STATUS];
export const NOTIFICATION_STATUSES: readonly NotificationStatus[] = Object.values(NOTIFICATION_STATUS);

export const NOTIFICATION_CHANNEL = {
    EMAIL: "EMAIL",
    IN_APP: "IN_APP",
} as const;
export type NotificationChannel = (typeof NOTIFICATION_CHANNEL)[keyof typeof NOTIFICATION_CHANNEL];
export const NOTIFICATION_CHANNELS: readonly NotificationChannel[] = Object.values(NOTIFICATION_CHANNEL);

export type NotificationPayload = Record<string, unknown>;
export type NotificationProps = {
    id: string;
    tenantId: string;
    recipientId: string;
    recipientEmail: string | null;
    code: string;
    channels: readonly NotificationChannel[];
    payload: NotificationPayload;
    locale: string;
    status: NotificationStatus;
    attempts: number;
    lastError: string | null;
    sentAt: Date | null;
    readAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

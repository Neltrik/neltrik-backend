import type { NotificationChannel, NotificationPayload } from "../../../../../domain/types";

export type SendNotificationOhsInput = {
    tenantId: string;
    recipientId: string;
    recipientEmail: string | null;
    code: string;
    channels: NotificationChannel[];
    payload: NotificationPayload;
    locale: string;
};

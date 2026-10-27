import type { NotificationCode } from "../../../../../domain/catalogs";
import type { NotificationChannel, NotificationPayload } from "../../../../../domain/types";

export type SendNotificationOhsInput = {
    tenantId: string;
    recipientId: string;
    recipientEmail: string | null;
    code: NotificationCode;
    channels: NotificationChannel[];
    payload: NotificationPayload;
    locale: string;
};

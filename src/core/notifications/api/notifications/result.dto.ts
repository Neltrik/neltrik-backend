import { type NotificationChannel, type NotificationPayload } from "../../domain/types";

export class SendNotificationDto {
    tenantId!: string;
    recipientId!: string;
    recipientEmail!: string | null;
    code!: string;
    channels!: NotificationChannel[];
    payload!: NotificationPayload;
    locale!: string;
}

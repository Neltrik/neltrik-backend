import { type Locale, type NotificationCode } from "../../domain/catalogs";
import { type NotificationChannel, type NotificationPayload } from "../../domain/types";

export class SendNotificationDto {
    tenantId!: string;
    recipientId!: string;
    recipientEmail!: string | null;
    code!: NotificationCode;
    channels!: NotificationChannel[];
    payload!: NotificationPayload;
    locale!: Locale;
}

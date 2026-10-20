import type { NotificationCode } from "../../../../../domain/catalogs";
import type { NotificationChannel } from "../../../../../domain/types";

export type ResolveNotificationTemplateInput = {
    code: NotificationCode;
    channel: NotificationChannel;
    locale: string;
    tenantId: string | null;
};

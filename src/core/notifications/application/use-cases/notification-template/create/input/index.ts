import type { NotificationCode } from "../../../../../domain/catalogs";
import type { NotificationChannel } from "../../../../../domain/types";

export type CreateNotificationTemplateInput = {
    actorTenantId: string;
    targetTenantId: string | null;
    code: NotificationCode;
    channel: NotificationChannel;
    locale: string;
    subject: string | null;
    body: string;
};

import type { NotificationChannel } from "../../../../../domain/types";

export type CreateNotificationTemplateInput = {
    actorTenantId: string;
    targetTenantId: string | null;
    code: string;
    channel: NotificationChannel;
    locale: string;
    subject: string | null;
    body: string;
};

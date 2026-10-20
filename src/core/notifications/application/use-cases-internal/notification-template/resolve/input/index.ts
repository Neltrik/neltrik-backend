import type { NotificationChannel } from "../../../../../domain/types";

export type ResolveNotificationTemplateInput = {
    code: string;
    channel: NotificationChannel;
    locale: string;
    tenantId: string | null;
};

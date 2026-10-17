import type { NotificationTemplate as PrismaNotificationTemplate } from "@prisma/client";

import { NotificationTemplate } from "../../../domain/entities";
import type { NotificationChannel } from "../../../domain/types";

export class NotificationTemplateMapper {
    public static toPersistence(template: NotificationTemplate) {
        return {
            id: template.id,
            tenantId: template.tenantId,
            code: template.code,
            channel: template.channel,
            locale: template.locale,
            subject: template.subject,
            body: template.body,
            isActive: template.isActive(),
            createdAt: template.createdAt,
            updatedAt: template.updatedAt,
        };
    }

    public static toDomain(template: PrismaNotificationTemplate): NotificationTemplate {
        return NotificationTemplate.restore({
            id: template.id,
            tenantId: template.tenantId,
            code: template.code,
            channel: template.channel as NotificationChannel,
            locale: template.locale,
            subject: template.subject,
            body: template.body,
            isActive: template.isActive,
            createdAt: template.createdAt,
            updatedAt: template.updatedAt,
        });
    }
}

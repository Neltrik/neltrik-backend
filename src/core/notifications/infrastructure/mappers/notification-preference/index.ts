import type { NotificationPreference as PrismaNotificationPreference } from "@prisma/client";

import { NotificationPreference } from "../../../domain/entities";
import type { NotificationCategory, NotificationChannel } from "../../../domain/types";

export class NotificationPreferenceMapper {
    public static toPersistence(preference: NotificationPreference) {
        return {
            id: preference.id,
            tenantId: preference.tenantId,
            ownerId: preference.ownerId,
            channel: preference.channel,
            category: preference.category,
            enabled: preference.isEnabled(),
            createdAt: preference.createdAt,
            updatedAt: preference.updatedAt,
        };
    }

    public static toDomain(preference: PrismaNotificationPreference): NotificationPreference {
        return NotificationPreference.restore({
            id: preference.id,
            tenantId: preference.tenantId,
            ownerId: preference.ownerId,
            channel: preference.channel as NotificationChannel,
            category: preference.category as NotificationCategory,
            enabled: preference.enabled,
            createdAt: preference.createdAt,
            updatedAt: preference.updatedAt,
        });
    }
}

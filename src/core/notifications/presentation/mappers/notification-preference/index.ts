import type { NotificationPreference } from "../../../domain/entities";
import type { NotificationPreferenceResponseDto } from "../../dto";

export class NotificationPreferenceMapper {
    public static toResponse(preference: NotificationPreference): NotificationPreferenceResponseDto {
        return {
            id: preference.id,
            channel: preference.channel,
            category: preference.category,
            enabled: preference.isEnabled(),
            createdAt: preference.createdAt,
            updatedAt: preference.updatedAt,
        };
    }
}

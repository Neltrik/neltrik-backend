import type { NotificationPreference } from "../../entities";
import type { FindByOwnerParams, NotificationCategory, NotificationChannel } from "../../types";

export abstract class NotificationPreferenceRepository {
    abstract create(preference: NotificationPreference): Promise<void>;
    abstract findById(id: string): Promise<NotificationPreference | null>;
    abstract findByOwner(params: FindByOwnerParams): Promise<NotificationPreference[]>;
    abstract findByOwnerAndChannelAndCategory(
        ownerId: string,
        channel: NotificationChannel,
        category: NotificationCategory,
    ): Promise<NotificationPreference | null>;
    abstract update(preference: NotificationPreference): Promise<void>;
    abstract delete(id: string): Promise<void>;
}

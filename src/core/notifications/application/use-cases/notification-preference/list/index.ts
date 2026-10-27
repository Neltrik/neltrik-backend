import { Injectable } from "@nestjs/common";

import { paginate } from "@/shared/pagination";

import { NotificationPreferenceRepository } from "../../../../domain/interfaces";
import type { ListNotificationPreferencesInput } from "./input";
import type { ListNotificationPreferencesOutput } from "./output";

@Injectable()
export class ListNotificationPreferencesUseCase {
    constructor(private readonly notificationPreferenceRepository: NotificationPreferenceRepository) {}

    public async execute(input: ListNotificationPreferencesInput): Promise<ListNotificationPreferencesOutput> {
        const preferences = await this.notificationPreferenceRepository.findByOwner({
            limit: input.limit,
            cursor: input.cursor,
            ownerId: input.actorUserId,
        });
        const { items, meta } = paginate({
            items: preferences,
            limit: input.limit,
            getId: (preference) => preference.id,
        });
        return { preferences: items, meta };
    }
}

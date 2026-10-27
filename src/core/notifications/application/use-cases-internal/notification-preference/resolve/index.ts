import { Injectable } from "@nestjs/common";

import { NotificationPreferenceRepository } from "../../../../domain/interfaces";
import type { ResolveNotificationPreferenceInput } from "./input";

@Injectable()
export class ResolveNotificationPreferenceInternalUseCase {
    constructor(private readonly notificationPreferenceRepository: NotificationPreferenceRepository) {}

    public async execute(input: ResolveNotificationPreferenceInput): Promise<boolean> {
        const preference = await this.notificationPreferenceRepository.findByOwnerAndChannelAndCategory(
            input.ownerId,
            input.channel,
            input.category,
        );
        if (!preference) {
            return true;
        }
        return preference.isEnabled();
    }
}

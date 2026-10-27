import { Injectable } from "@nestjs/common";

import { NotificationPreference } from "../../../../domain/entities";
import { NotificationPreferenceNotFoundError } from "../../../../domain/errors";
import { NotificationPreferenceRepository } from "../../../../domain/interfaces";
import type { GetNotificationPreferenceInput } from "./input";

@Injectable()
export class GetNotificationPreferenceUseCase {
    constructor(private readonly notificationPreferenceRepository: NotificationPreferenceRepository) {}

    public async execute(input: GetNotificationPreferenceInput): Promise<NotificationPreference> {
        const preference = await this.notificationPreferenceRepository.findById(input.preferenceId);
        if (!preference) {
            throw new NotificationPreferenceNotFoundError();
        }
        return preference;
    }
}

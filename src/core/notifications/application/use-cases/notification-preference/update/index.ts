import { Injectable } from "@nestjs/common";

import { ForbiddenError } from "@/shared/errors";

import { NotificationPreferenceNotFoundError } from "../../../../domain/errors";
import { NotificationPreferenceRepository } from "../../../../domain/interfaces";
import type { UpdateNotificationPreferenceInput } from "./input";

@Injectable()
export class UpdateNotificationPreferenceUseCase {
    constructor(private readonly notificationPreferenceRepository: NotificationPreferenceRepository) {}

    public async execute(input: UpdateNotificationPreferenceInput): Promise<string> {
        const preference = await this.notificationPreferenceRepository.findById(input.preferenceId);
        if (!preference) {
            throw new NotificationPreferenceNotFoundError();
        }
        if (preference.ownerId !== input.actorUserId) {
            throw new ForbiddenError();
        }
        if (input.enabled) {
            preference.enable();
        } else {
            preference.disable();
        }
        await this.notificationPreferenceRepository.update(preference);
        return preference.id;
    }
}

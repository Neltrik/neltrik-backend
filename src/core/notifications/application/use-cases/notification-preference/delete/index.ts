import { Injectable } from "@nestjs/common";

import { ForbiddenError } from "@/shared/errors";

import { NotificationPreferenceNotFoundError } from "../../../../domain/errors";
import { NotificationPreferenceRepository } from "../../../../domain/interfaces";
import type { DeleteNotificationPreferenceInput } from "./input";

@Injectable()
export class DeleteNotificationPreferenceUseCase {
    constructor(private readonly notificationPreferenceRepository: NotificationPreferenceRepository) {}

    public async execute(input: DeleteNotificationPreferenceInput): Promise<string> {
        const preference = await this.notificationPreferenceRepository.findById(input.preferenceId);
        if (!preference) {
            throw new NotificationPreferenceNotFoundError();
        }
        if (preference.ownerId !== input.actorUserId) {
            throw new ForbiddenError();
        }
        await this.notificationPreferenceRepository.delete(input.preferenceId);
        return input.preferenceId;
    }
}

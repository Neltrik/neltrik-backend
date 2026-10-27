import { Injectable } from "@nestjs/common";

import { IdGenerator } from "@/shared/id-generator";

import { NotificationPreference } from "../../../../domain/entities";
import { NotificationPreferenceAlreadyExistsError } from "../../../../domain/errors";
import { NotificationPreferenceRepository } from "../../../../domain/interfaces";
import type { CreateNotificationPreferenceInput } from "./input";

@Injectable()
export class CreateNotificationPreferenceUseCase {
    constructor(
        private readonly idGenerator: IdGenerator,
        private readonly notificationPreferenceRepository: NotificationPreferenceRepository,
    ) {}

    public async execute(input: CreateNotificationPreferenceInput): Promise<string> {
        const existing = await this.notificationPreferenceRepository.findByOwnerAndChannelAndCategory(
            input.actorUserId,
            input.channel,
            input.category,
        );
        if (existing) {
            throw new NotificationPreferenceAlreadyExistsError();
        }
        const now = new Date();
        const preference = NotificationPreference.create({
            id: this.idGenerator.generate(),
            tenantId: input.actorTenantId,
            ownerId: input.actorUserId,
            channel: input.channel,
            category: input.category,
            createdAt: now,
        });
        await this.notificationPreferenceRepository.create(preference);
        return preference.id;
    }
}

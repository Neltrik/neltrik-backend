import { Injectable } from "@nestjs/common";

import { NotificationRepository } from "../../../../domain/interfaces";
import type { MarkAllNotificationsAsReadInput } from "./input";

@Injectable()
export class MarkAllNotificationsAsReadUseCase {
    constructor(private readonly notificationRepository: NotificationRepository) {}

    public async execute(input: MarkAllNotificationsAsReadInput): Promise<number> {
        const updatedCount = await this.notificationRepository.markAllInAppAsRead(
            input.actorTenantId,
            input.actorUserId,
        );
        return updatedCount;
    }
}

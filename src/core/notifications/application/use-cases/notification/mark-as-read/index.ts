import { Injectable } from "@nestjs/common";

import { ForbiddenError } from "@/shared/errors";

import { NotificationNotFoundError } from "../../../../domain/errors";
import { NotificationRepository } from "../../../../domain/interfaces";
import type { MarkNotificationAsReadInput } from "./input";

@Injectable()
export class MarkNotificationAsReadUseCase {
    constructor(private readonly notificationRepository: NotificationRepository) {}

    public async execute(input: MarkNotificationAsReadInput): Promise<string> {
        const notification = await this.notificationRepository.findById(input.notificationId);
        if (!notification) {
            throw new NotificationNotFoundError();
        }
        if (notification.recipientId !== input.actorUserId) {
            throw new ForbiddenError();
        }
        notification.markAsRead();
        await this.notificationRepository.update(notification);
        return notification.id;
    }
}

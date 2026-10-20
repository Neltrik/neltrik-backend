import { Injectable } from "@nestjs/common";

import { paginate } from "@/shared/pagination";

import { NotificationRepository } from "../../../../domain/interfaces";
import type { ListNotificationsInput } from "./input";
import type { ListNotificationsOutput } from "./output";

@Injectable()
export class ListNotificationsUseCase {
    constructor(private readonly notificationRepository: NotificationRepository) {}

    public async execute(input: ListNotificationsInput): Promise<ListNotificationsOutput> {
        const notifications = await this.notificationRepository.findInAppByTenantAndRecipient({
            tenantId: input.actorTenantId,
            recipientId: input.actorUserId,
            cursor: input.cursor,
            limit: input.limit,
        });
        const { items, meta } = paginate({
            items: notifications,
            limit: input.limit,
            getId: (notification) => notification.id,
        });
        return { notifications: items, meta };
    }
}

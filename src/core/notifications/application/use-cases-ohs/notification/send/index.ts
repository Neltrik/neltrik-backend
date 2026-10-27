import { Injectable } from "@nestjs/common";

import { TenantApi } from "@/core/tenant/api";
import { IdGenerator } from "@/shared/id-generator";
import { JobScheduler } from "@/shared/jobs";

import { NOTIFICATION_CODE_CATEGORIES } from "../../../../domain/catalogs";
import { Notification } from "../../../../domain/entities";
import { NotificationRepository } from "../../../../domain/interfaces";
import {
    NOTIFICATION_CATEGORY,
    type NotificationChannel,
    SEND_NOTIFICATION_JOB,
    SEND_NOTIFICATION_QUEUE,
} from "../../../../domain/types";
import {
    ResolveNotificationPreferenceInternalUseCase,
    ResolveNotificationTemplateInternalUseCase,
} from "../../../use-cases-internal";
import type { SendNotificationOhsInput } from "./input";

@Injectable()
export class SendNotificationOhsUseCase {
    constructor(
        private readonly tenantApi: TenantApi,
        private readonly idGenerator: IdGenerator,
        private readonly jobScheduler: JobScheduler,
        private readonly notificationRepository: NotificationRepository,
        private readonly resolveNotificationTemplateUseCase: ResolveNotificationTemplateInternalUseCase,
        private readonly resolveNotificationPreferenceUseCase: ResolveNotificationPreferenceInternalUseCase,
    ) {}

    public async execute(input: SendNotificationOhsInput): Promise<string | null> {
        await this.tenantApi.validate(input.tenantId);
        const channels = await this.filterChannels(input);
        if (channels.length === 0) {
            return null;
        }
        for (const channel of channels) {
            await this.resolveNotificationTemplateUseCase.execute({
                code: input.code,
                channel,
                locale: input.locale,
                tenantId: input.tenantId,
            });
        }
        const notification = Notification.create({
            id: this.idGenerator.generate(),
            tenantId: input.tenantId,
            recipientId: input.recipientId,
            recipientEmail: input.recipientEmail,
            code: input.code,
            channels,
            payload: input.payload,
            locale: input.locale,
            createdAt: new Date(),
        });
        await this.notificationRepository.create(notification);
        await this.jobScheduler.enqueue(
            SEND_NOTIFICATION_QUEUE,
            SEND_NOTIFICATION_JOB,
            { notificationId: notification.id },
            { attempts: 3, backoff: { type: "exponential", delayMs: 5000 }, removeOnComplete: 100, removeOnFail: 1000 },
        );
        return notification.id;
    }

    private async filterChannels(input: SendNotificationOhsInput): Promise<NotificationChannel[]> {
        const category = NOTIFICATION_CODE_CATEGORIES[input.code];
        if (category === NOTIFICATION_CATEGORY.TRANSACTIONAL) {
            return input.channels;
        }
        const allowed: NotificationChannel[] = [];
        for (const channel of input.channels) {
            const accepted = await this.resolveNotificationPreferenceUseCase.execute({
                ownerId: input.recipientId,
                channel,
                category: NOTIFICATION_CATEGORY.MARKETING,
            });
            if (accepted) {
                allowed.push(channel);
            }
        }
        return allowed;
    }
}

export type { SendNotificationOhsInput };

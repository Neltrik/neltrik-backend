import { Injectable } from "@nestjs/common";

import { TenantApi } from "@/core/tenant/api";
import { IdGenerator } from "@/shared/id-generator";
import { JobScheduler } from "@/shared/jobs";

import { Notification } from "../../../../domain/entities";
import { NotificationRepository } from "../../../../domain/interfaces";
import { SEND_NOTIFICATION_JOB, SEND_NOTIFICATION_QUEUE } from "../../../../domain/types";
import { ResolveNotificationTemplateInternalUseCase } from "../../../use-cases-internal";
import type { SendNotificationOhsInput } from "./input";

@Injectable()
export class SendNotificationOhsUseCase {
    constructor(
        private readonly tenantApi: TenantApi,
        private readonly idGenerator: IdGenerator,
        private readonly jobScheduler: JobScheduler,
        private readonly notificationRepository: NotificationRepository,
        private readonly resolveNotificationTemplateUseCase: ResolveNotificationTemplateInternalUseCase,
    ) {}

    public async execute(input: SendNotificationOhsInput): Promise<string> {
        await this.tenantApi.validate(input.tenantId);
        for (const channel of input.channels) {
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
            channels: input.channels,
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
}

export type { SendNotificationOhsInput };

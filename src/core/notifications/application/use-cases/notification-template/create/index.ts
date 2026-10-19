import { Injectable } from "@nestjs/common";

import { TenantApi } from "@/core/tenant/api";
import { ForbiddenError } from "@/shared/errors";
import { IdGenerator } from "@/shared/id-generator";

import { NotificationTemplate } from "../../../../domain/entities";
import { NotificationTemplateAlreadyExistsError } from "../../../../domain/errors";
import { NotificationTemplateRepository } from "../../../../domain/interfaces";
import type { CreateNotificationTemplateInput } from "./input";

@Injectable()
export class CreateNotificationTemplateUseCase {
    constructor(
        private readonly tenantApi: TenantApi,
        private readonly idGenerator: IdGenerator,
        private readonly notificationTemplateRepository: NotificationTemplateRepository,
    ) {}

    public async execute(input: CreateNotificationTemplateInput): Promise<string> {
        const isPlatformActor = await this.tenantApi.isPlatformTenant(input.actorTenantId);
        if (!isPlatformActor && input.targetTenantId !== input.actorTenantId) {
            throw new ForbiddenError();
        }
        const now = new Date();
        const template = NotificationTemplate.create({
            id: this.idGenerator.generate(),
            tenantId: input.targetTenantId,
            code: input.code,
            channel: input.channel,
            locale: input.locale,
            subject: input.subject,
            body: input.body,
            createdAt: now,
        });
        const candidates = await this.notificationTemplateRepository.findActiveByCombinationCandidates(
            input.code,
            input.channel,
            input.locale,
            input.targetTenantId,
        );
        const hasConflict = candidates.some((candidate) => template.hasConflict(candidate));
        if (hasConflict) {
            throw new NotificationTemplateAlreadyExistsError();
        }
        await this.notificationTemplateRepository.create(template);
        return template.id;
    }
}

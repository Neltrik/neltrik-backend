import { Injectable } from "@nestjs/common";

import { TenantApi } from "@/core/tenant/api";
import { ForbiddenError } from "@/shared/errors";

import { NotificationTemplateAlreadyExistsError, NotificationTemplateNotFoundError } from "../../../../domain/errors";
import { NotificationTemplateRepository } from "../../../../domain/interfaces";
import type { ActivateNotificationTemplateInput } from "./input";

@Injectable()
export class ActivateNotificationTemplateUseCase {
    constructor(
        private readonly tenantApi: TenantApi,
        private readonly notificationTemplateRepository: NotificationTemplateRepository,
    ) {}

    public async execute(input: ActivateNotificationTemplateInput): Promise<string> {
        const template = await this.notificationTemplateRepository.findById(input.id);
        if (!template) {
            throw new NotificationTemplateNotFoundError();
        }
        const isPlatformActor = await this.tenantApi.isPlatformTenant(input.actorTenantId);
        if (!isPlatformActor) {
            if (template.tenantId === null) {
                throw new ForbiddenError();
            }
            if (template.tenantId !== input.actorTenantId) {
                throw new ForbiddenError();
            }
        }
        if (template.isActive()) {
            return template.id;
        }
        const candidates = await this.notificationTemplateRepository.findActiveByCombinationCandidates(
            template.code,
            template.channel,
            template.locale,
            template.tenantId,
            template.id,
        );
        const hasConflict = candidates.some((candidate) => template.hasConflict(candidate));
        if (hasConflict) {
            throw new NotificationTemplateAlreadyExistsError();
        }
        template.activate();
        await this.notificationTemplateRepository.update(template);
        return template.id;
    }
}

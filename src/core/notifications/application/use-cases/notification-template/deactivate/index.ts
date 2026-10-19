import { Injectable } from "@nestjs/common";

import { TenantApi } from "@/core/tenant/api";
import { ForbiddenError } from "@/shared/errors";

import { NotificationTemplateNotFoundError } from "../../../../domain/errors";
import { NotificationTemplateRepository } from "../../../../domain/interfaces";
import type { DeactivateNotificationTemplateInput } from "./input";

@Injectable()
export class DeactivateNotificationTemplateUseCase {
    constructor(
        private readonly tenantApi: TenantApi,
        private readonly notificationTemplateRepository: NotificationTemplateRepository,
    ) {}

    public async execute(input: DeactivateNotificationTemplateInput): Promise<string> {
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
        if (!template.isActive()) {
            return template.id;
        }
        template.deactivate();
        await this.notificationTemplateRepository.update(template);
        return template.id;
    }
}

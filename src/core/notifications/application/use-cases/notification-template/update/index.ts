import { Injectable } from "@nestjs/common";

import { TenantApi } from "@/core/tenant/api";
import { ForbiddenError } from "@/shared/errors";

import { NotificationTemplateNotFoundError } from "../../../../domain/errors";
import { NotificationTemplateRepository } from "../../../../domain/interfaces";
import type { UpdateNotificationTemplateInput } from "./input";

@Injectable()
export class UpdateNotificationTemplateUseCase {
    constructor(
        private readonly tenantApi: TenantApi,
        private readonly notificationTemplateRepository: NotificationTemplateRepository,
    ) {}

    public async execute(input: UpdateNotificationTemplateInput): Promise<string> {
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
        template.updateContent(input.subject, input.body);
        await this.notificationTemplateRepository.update(template);
        return template.id;
    }
}

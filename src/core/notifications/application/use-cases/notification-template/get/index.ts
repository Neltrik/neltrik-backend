import { Injectable } from "@nestjs/common";

import { TenantApi } from "@/core/tenant/api";
import { ForbiddenError } from "@/shared/errors/http-errors/forbidden";

import { NotificationTemplate } from "../../../../domain/entities";
import { NotificationTemplateNotFoundError } from "../../../../domain/errors";
import { NotificationTemplateRepository } from "../../../../domain/interfaces";
import type { GetNotificationTemplateInput } from "./input";

@Injectable()
export class GetNotificationTemplateUseCase {
    constructor(
        private readonly tenantApi: TenantApi,
        private readonly notificationTemplateRepository: NotificationTemplateRepository,
    ) {}

    public async execute(input: GetNotificationTemplateInput): Promise<NotificationTemplate> {
        const template = await this.notificationTemplateRepository.findById(input.id);
        if (!template) {
            throw new NotificationTemplateNotFoundError();
        }
        const isPlatformActor = await this.tenantApi.isPlatformTenant(input.actorTenantId);
        if (!isPlatformActor && template.tenantId !== null && template.tenantId !== input.actorTenantId) {
            throw new ForbiddenError();
        }
        return template;
    }
}

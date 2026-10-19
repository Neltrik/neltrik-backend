import { Injectable } from "@nestjs/common";

import { TenantApi } from "@/core/tenant/api";
import { paginate } from "@/shared/pagination";

import { NotificationTemplateRepository } from "../../../../domain/interfaces";
import type { ListNotificationTemplatesInput } from "./input";
import type { ListNotificationTemplatesOutput } from "./output";

@Injectable()
export class ListNotificationTemplatesUseCase {
    constructor(
        private readonly tenantApi: TenantApi,
        private readonly notificationTemplateRepository: NotificationTemplateRepository,
    ) {}

    public async execute(input: ListNotificationTemplatesInput): Promise<ListNotificationTemplatesOutput> {
        const isPlatformActor = await this.tenantApi.isPlatformTenant(input.actorTenantId);
        const templates = isPlatformActor
            ? await this.notificationTemplateRepository.findAll({
                  cursor: input.cursor,
                  limit: input.limit,
              })
            : await this.notificationTemplateRepository.findByTenantIncludingGlobal({
                  tenantId: input.actorTenantId,
                  cursor: input.cursor,
                  limit: input.limit,
              });
        const { items, meta } = paginate({
            items: templates,
            limit: input.limit,
            getId: (template) => template.id,
        });
        return { templates: items, meta };
    }
}

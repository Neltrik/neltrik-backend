import type { PaginationInput } from "@/shared/pagination";

import type { NotificationTemplate } from "../../entities";
import type { FindTemplatesByTenantParams, NotificationChannel } from "../../types";

export abstract class NotificationTemplateRepository {
    abstract create(template: NotificationTemplate): Promise<void>;
    abstract findById(id: string): Promise<NotificationTemplate | null>;
    abstract findActiveByCombination(
        code: string,
        channel: NotificationChannel,
        locale: string,
        tenantId: string | null,
    ): Promise<NotificationTemplate | null>;
    abstract findActiveByCombinationCandidates(
        code: string,
        channel: NotificationChannel,
        locale: string,
        tenantId: string | null,
        excludeId?: string,
    ): Promise<NotificationTemplate[]>;
    abstract update(template: NotificationTemplate): Promise<void>;
    abstract findByTenantIncludingGlobal(params: FindTemplatesByTenantParams): Promise<NotificationTemplate[]>;
    abstract findAll(params: PaginationInput): Promise<NotificationTemplate[]>;
}

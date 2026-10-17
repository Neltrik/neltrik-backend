import type { NotificationTemplate } from "../../entities";
import type { NotificationChannel } from "../../types";

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
    abstract findByTenant(tenantId: string): Promise<NotificationTemplate[]>;
}

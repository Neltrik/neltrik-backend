import type { Notification } from "../../entities";
import { type FindInAppByTenantAndRecipientParams } from "../../types";

export abstract class NotificationRepository {
    abstract create(notification: Notification): Promise<void>;
    abstract findById(id: string): Promise<Notification | null>;
    abstract findByTenantAndRecipient(tenantId: string, recipientId: string): Promise<Notification[]>;
    abstract findInAppByTenantAndRecipient(params: FindInAppByTenantAndRecipientParams): Promise<Notification[]>;
    abstract update(notification: Notification): Promise<void>;
}

import type { Notification } from "../../entities";
import { type FindInAppByTenantAndRecipientParams } from "../../types";

export abstract class NotificationRepository {
    abstract create(notification: Notification): Promise<void>;
    abstract findById(id: string): Promise<Notification | null>;
    abstract findInAppByTenantAndRecipient(params: FindInAppByTenantAndRecipientParams): Promise<Notification[]>;
    abstract markAllInAppAsRead(tenantId: string, recipientId: string): Promise<number>;
    abstract update(notification: Notification): Promise<void>;
}

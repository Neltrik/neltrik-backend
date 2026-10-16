import type { Notification } from "../../entities";

export abstract class NotificationRepository {
    abstract create(notification: Notification): Promise<void>;
    abstract findById(id: string): Promise<Notification | null>;
    abstract findByTenantAndRecipient(tenantId: string, recipientId: string): Promise<Notification[]>;
    abstract update(notification: Notification): Promise<void>;
}

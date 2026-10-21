import { Injectable } from "@nestjs/common";

import { PrismaService } from "@/prisma/index";
import { withPaginationArgs } from "@/shared/pagination";

import { Notification } from "../../../domain/entities";
import { NotificationRepository } from "../../../domain/interfaces";
import { type FindInAppByTenantAndRecipientParams } from "../../../domain/types";
import { NotificationMapper } from "../../mappers";

@Injectable()
export class PrismaNotificationRepository extends NotificationRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    public async create(notification: Notification): Promise<void> {
        await this.prisma.tenantClient.notification.create({
            data: NotificationMapper.toPersistence(notification),
        });
    }

    public async findById(id: string): Promise<Notification | null> {
        const notification = await this.prisma.tenantClient.notification.findFirst({ where: { id } });
        if (!notification) {
            return null;
        }
        return NotificationMapper.toDomain(notification);
    }

    public async findInAppByTenantAndRecipient(params: FindInAppByTenantAndRecipientParams): Promise<Notification[]> {
        const { tenantId, recipientId, cursor, limit } = params;
        const notifications = await this.prisma.tenantClient.notification.findMany({
            where: { tenantId, recipientId, channels: { has: "IN_APP" } },
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            ...withPaginationArgs({ cursor, limit }),
        });
        return notifications.map((n) => NotificationMapper.toDomain(n));
    }

    public async markAllInAppAsRead(tenantId: string, recipientId: string): Promise<number> {
        const result = await this.prisma.tenantClient.notification.updateMany({
            where: { tenantId, recipientId, channels: { has: "IN_APP" }, readAt: null },
            data: { readAt: new Date() },
        });
        return result.count;
    }

    public async update(notification: Notification): Promise<void> {
        await this.prisma.tenantClient.notification.update({
            where: { id: notification.id },
            data: NotificationMapper.toPersistence(notification),
        });
    }
}

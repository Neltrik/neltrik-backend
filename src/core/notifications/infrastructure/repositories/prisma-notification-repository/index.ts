import { Injectable } from "@nestjs/common";

import { PrismaService } from "@/prisma/index";

import { Notification } from "../../../domain/entities";
import { NotificationRepository } from "../../../domain/interfaces";
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

    public async findByTenantAndRecipient(tenantId: string, recipientId: string): Promise<Notification[]> {
        const notifications = await this.prisma.tenantClient.notification.findMany({
            where: { tenantId, recipientId },
            orderBy: { createdAt: "desc" },
        });
        return notifications.map((notification) => NotificationMapper.toDomain(notification));
    }

    public async update(notification: Notification): Promise<void> {
        await this.prisma.tenantClient.notification.update({
            where: { id: notification.id },
            data: NotificationMapper.toPersistence(notification),
        });
    }
}

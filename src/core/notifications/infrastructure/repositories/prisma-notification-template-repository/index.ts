import { Injectable } from "@nestjs/common";

import { PrismaService } from "@/prisma/index";

import { NotificationTemplate } from "../../../domain/entities";
import { NotificationTemplateRepository } from "../../../domain/interfaces";
import type { NotificationChannel } from "../../../domain/types";
import { NotificationTemplateMapper } from "../../mappers";

@Injectable()
export class PrismaNotificationTemplateRepository extends NotificationTemplateRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    public async create(template: NotificationTemplate): Promise<void> {
        await this.prisma.tenantClient.notificationTemplate.create({
            data: NotificationTemplateMapper.toPersistence(template),
        });
    }

    public async findById(id: string): Promise<NotificationTemplate | null> {
        const template = await this.prisma.tenantClient.notificationTemplate.findFirst({
            where: { id },
        });
        if (!template) {
            return null;
        }
        return NotificationTemplateMapper.toDomain(template);
    }

    public async findActiveByCombination(
        code: string,
        channel: NotificationChannel,
        locale: string,
        tenantId: string | null,
    ): Promise<NotificationTemplate | null> {
        if (tenantId) {
            const tenantTemplate = await this.prisma.tenantClient.notificationTemplate.findFirst({
                where: { code, channel, locale, isActive: true, tenantId },
            });
            if (tenantTemplate) {
                return NotificationTemplateMapper.toDomain(tenantTemplate);
            }
        }
        const globalTemplate = await this.prisma.tenantClient.notificationTemplate.findFirst({
            where: { code, channel, locale, isActive: true, tenantId: null },
        });
        if (!globalTemplate) {
            return null;
        }
        return NotificationTemplateMapper.toDomain(globalTemplate);
    }

    public async findActiveByCombinationCandidates(
        code: string,
        channel: NotificationChannel,
        locale: string,
        tenantId: string | null,
        excludeId?: string,
    ): Promise<NotificationTemplate[]> {
        const templates = await this.prisma.notificationTemplate.findMany({
            where: { code, channel, locale, isActive: true, tenantId, ...(excludeId && { id: { not: excludeId } }) },
        });
        return templates.map((template) => NotificationTemplateMapper.toDomain(template));
    }

    public async update(template: NotificationTemplate): Promise<void> {
        await this.prisma.tenantClient.notificationTemplate.update({
            where: { id: template.id },
            data: NotificationTemplateMapper.toPersistence(template),
        });
    }

    public async findByTenant(tenantId: string): Promise<NotificationTemplate[]> {
        const templates = await this.prisma.tenantClient.notificationTemplate.findMany({
            where: { tenantId },
            orderBy: { createdAt: "desc" },
        });
        return templates.map((template) => NotificationTemplateMapper.toDomain(template));
    }
}

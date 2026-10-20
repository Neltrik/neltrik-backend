import { Injectable } from "@nestjs/common";

import { NotificationCode } from "@/core/notifications/domain/catalogs";
import { PrismaService } from "@/prisma/index";
import { PaginationInput, withPaginationArgs } from "@/shared/pagination";

import { NotificationTemplate } from "../../../domain/entities";
import { NotificationTemplateRepository } from "../../../domain/interfaces";
import type { FindTemplatesByTenantParams, NotificationChannel } from "../../../domain/types";
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
        code: NotificationCode,
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
        code: NotificationCode,
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

    public async findByTenantIncludingGlobal(params: FindTemplatesByTenantParams): Promise<NotificationTemplate[]> {
        const templates = await this.prisma.tenantClient.notificationTemplate.findMany({
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            ...withPaginationArgs({ cursor: params.cursor, limit: params.limit }),
        });
        return templates.map((template) => NotificationTemplateMapper.toDomain(template));
    }

    public async findAll(params: PaginationInput): Promise<NotificationTemplate[]> {
        const templates = await this.prisma.tenantClient.notificationTemplate.findMany({
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            ...withPaginationArgs({ cursor: params.cursor, limit: params.limit }),
        });
        return templates.map((template) => NotificationTemplateMapper.toDomain(template));
    }
}

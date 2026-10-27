import { Injectable } from "@nestjs/common";

import { PrismaService } from "@/prisma/index";
import { withPaginationArgs } from "@/shared/pagination";

import { NotificationPreference } from "../../../domain/entities";
import { NotificationPreferenceRepository } from "../../../domain/interfaces";
import type { FindByOwnerParams, NotificationCategory, NotificationChannel } from "../../../domain/types";
import { NotificationPreferenceMapper } from "../../mappers";

@Injectable()
export class PrismaNotificationPreferenceRepository extends NotificationPreferenceRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    public async create(preference: NotificationPreference): Promise<void> {
        await this.prisma.tenantClient.notificationPreference.create({
            data: NotificationPreferenceMapper.toPersistence(preference),
        });
    }

    public async findById(id: string): Promise<NotificationPreference | null> {
        const preference = await this.prisma.tenantClient.notificationPreference.findFirst({
            where: { id },
        });
        if (!preference) {
            return null;
        }
        return NotificationPreferenceMapper.toDomain(preference);
    }

    public async findByOwner(params: FindByOwnerParams): Promise<NotificationPreference[]> {
        const preferences = await this.prisma.tenantClient.notificationPreference.findMany({
            where: { ownerId: params.ownerId },
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            ...withPaginationArgs({ cursor: params.cursor, limit: params.limit }),
        });
        return preferences.map((preference) => NotificationPreferenceMapper.toDomain(preference));
    }

    public async findByOwnerAndChannelAndCategory(
        ownerId: string,
        channel: NotificationChannel,
        category: NotificationCategory,
    ): Promise<NotificationPreference | null> {
        const preference = await this.prisma.tenantClient.notificationPreference.findFirst({
            where: { ownerId, channel, category },
        });
        if (!preference) {
            return null;
        }
        return NotificationPreferenceMapper.toDomain(preference);
    }

    public async update(preference: NotificationPreference): Promise<void> {
        await this.prisma.tenantClient.notificationPreference.update({
            where: { id: preference.id },
            data: NotificationPreferenceMapper.toPersistence(preference),
        });
    }

    public async delete(id: string): Promise<void> {
        await this.prisma.tenantClient.notificationPreference.delete({ where: { id } });
    }
}

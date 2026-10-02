import { Injectable } from "@nestjs/common";

import { PrismaService } from "@/prisma/index";

import { FileQuota } from "../../../domain/entities";
import { FileQuotaRepository } from "../../../domain/interfaces";
import { FileQuotaMapper } from "../../mappers";

@Injectable()
export class PrismaFileQuotaRepository extends FileQuotaRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    public async create(quota: FileQuota): Promise<void> {
        await this.prisma.tenantClient.fileQuota.create({
            data: FileQuotaMapper.toPersistence(quota),
        });
    }

    public async findByTenantId(tenantId: string): Promise<FileQuota | null> {
        const quota = await this.prisma.tenantClient.fileQuota.findUnique({ where: { tenantId } });
        if (!quota) {
            return null;
        }
        return FileQuotaMapper.toDomain(quota);
    }

    public async update(quota: FileQuota): Promise<void> {
        await this.prisma.tenantClient.fileQuota.update({
            where: { id: quota.id },
            data: FileQuotaMapper.toPersistence(quota),
        });
    }
}

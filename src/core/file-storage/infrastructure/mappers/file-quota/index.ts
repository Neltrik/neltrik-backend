import type { FileQuota as PrismaFileQuota } from "@prisma/client";

import { FileQuota } from "../../../domain/entities";

export class FileQuotaMapper {
    public static toPersistence(quota: FileQuota) {
        return {
            id: quota.id,
            tenantId: quota.tenantId,
            limitBytes: BigInt(quota.limitBytes),
            usedBytes: BigInt(quota.usedBytes),
            createdAt: quota.createdAt,
            updatedAt: quota.updatedAt,
        };
    }

    public static toDomain(quota: PrismaFileQuota): FileQuota {
        return FileQuota.restore({
            id: quota.id,
            tenantId: quota.tenantId,
            limitBytes: Number(quota.limitBytes),
            usedBytes: Number(quota.usedBytes),
            createdAt: quota.createdAt,
            updatedAt: quota.updatedAt,
        });
    }
}

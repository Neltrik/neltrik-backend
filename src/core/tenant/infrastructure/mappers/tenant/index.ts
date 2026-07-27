import type { Tenant as PrismaTenant } from "@prisma/client";

import { Tenant } from "../../../domain/entities/tenant";

export class TenantMapper {
    public static toPersistence(tenant: Tenant) {
        return {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            status: tenant.status,
            createdAt: tenant.createdAt,
            updatedAt: tenant.updatedAt,
            suspendedAt: tenant.suspendedAt,
        };
    }

    public static toDomain(tenant: PrismaTenant): Tenant {
        return Tenant.restore({
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            status: tenant.status,
            createdAt: tenant.createdAt,
            updatedAt: tenant.updatedAt,
            suspendedAt: tenant.suspendedAt,
        });
    }
}

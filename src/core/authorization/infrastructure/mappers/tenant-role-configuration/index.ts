import type { TenantRoleConfiguration as PrismaTenantRoleConfiguration } from "@prisma/client";

import { TenantRoleConfiguration } from "../../../domain/entities";
import { DisplayName } from "../../../domain/value-objects";

export class TenantRoleConfigurationMapper {
    public static toPersistence(tenantRoleConfiguration: TenantRoleConfiguration) {
        return {
            id: tenantRoleConfiguration.id,
            tenantId: tenantRoleConfiguration.tenantId,
            roleId: tenantRoleConfiguration.roleId,
            displayName: tenantRoleConfiguration.displayName.value,
            createdAt: tenantRoleConfiguration.createdAt,
            updatedAt: tenantRoleConfiguration.updatedAt,
        };
    }

    public static toDomain(tenantRoleConfiguration: PrismaTenantRoleConfiguration): TenantRoleConfiguration {
        return TenantRoleConfiguration.restore({
            id: tenantRoleConfiguration.id,
            tenantId: tenantRoleConfiguration.tenantId,
            roleId: tenantRoleConfiguration.roleId,
            displayName: DisplayName.create(tenantRoleConfiguration.displayName),
            createdAt: tenantRoleConfiguration.createdAt,
            updatedAt: tenantRoleConfiguration.updatedAt,
        });
    }
}

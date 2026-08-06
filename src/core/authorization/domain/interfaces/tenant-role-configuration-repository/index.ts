import type { TenantRoleConfiguration } from "../../entities";

export abstract class TenantRoleConfigurationRepository {
    abstract create(tenantRoleConfiguration: TenantRoleConfiguration): Promise<TenantRoleConfiguration>;
    abstract update(tenantRoleConfiguration: TenantRoleConfiguration): Promise<TenantRoleConfiguration>;
    abstract delete(id: string): Promise<void>;
    abstract findByTenantAndRole(tenantId: string, roleId: string): Promise<TenantRoleConfiguration | null>;
    abstract list(tenantId: string): Promise<TenantRoleConfiguration[]>;
}

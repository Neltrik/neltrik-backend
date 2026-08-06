import type { DisplayName } from "../../value-objects";

export interface TenantRoleConfigurationProps {
    id: string;
    tenantId: string;
    roleId: string;
    displayName: DisplayName;
    createdAt: Date;
    updatedAt: Date;
}

export type CreateTenantRoleConfigurationState = Omit<TenantRoleConfigurationProps, "id" | "createdAt" | "updatedAt">;

export type UpdateTenantRoleConfigurationState = Pick<TenantRoleConfigurationProps, "displayName">;

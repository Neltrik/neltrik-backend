import type { RoleScope } from "../../../../../domain/types";

export type GetRolesByTenantOhsOutput = {
    id: string;
    code: string;
    defaultDisplayName: string;
    description: string;
    scope: RoleScope;
};

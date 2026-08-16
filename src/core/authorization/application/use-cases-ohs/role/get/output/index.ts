import type { Permission } from "../../../../../domain/entities";
import type { RoleScope } from "../../../../../domain/types";

export interface GetRoleOhsOutput {
    id: string;
    code: string;
    defaultDisplayName: string;
    description: string;
    scope: RoleScope;
    permissions: Permission[];
}

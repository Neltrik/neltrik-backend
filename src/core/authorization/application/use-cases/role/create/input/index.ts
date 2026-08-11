import { type RoleScope } from "../../../../../domain/types";

export interface CreateRoleInput {
    code: string;
    defaultDisplayName: string;
    description: string;
    scope: RoleScope;
}

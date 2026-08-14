import type { PermissionScope } from "../../../../../domain/types";

export interface CreatePermissionInput {
    code: string;
    description: string;
    scope: PermissionScope;
}

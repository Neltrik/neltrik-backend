import type { TransactionContext } from "@/shared/transaction";

import type { Permission, Role } from "../../entities";

export abstract class RoleRepository {
    abstract create(role: Role): Promise<void>;
    abstract update(role: Role): Promise<void>;
    abstract get(id: string): Promise<Role | null>;
    abstract getByIds(ids: string[]): Promise<Role[]>;
    abstract list(): Promise<Role[]>;
    abstract existsByCode(code: string): Promise<boolean>;
    abstract assignPermissions(roleId: string, permissionIds: string[], context: TransactionContext): Promise<void>;
    abstract removePermissions(roleId: string, permissionIds: string[], context: TransactionContext): Promise<void>;
    abstract getPermissionsByRole(roleId: string): Promise<Permission[]>;
}

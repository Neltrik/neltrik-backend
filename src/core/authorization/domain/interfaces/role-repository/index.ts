import type { TransactionContext } from "@/shared/transaction";

import type { Role } from "../../entities";

export abstract class RoleRepository {
    abstract create(role: Role): Promise<void>;
    abstract update(role: Role): Promise<void>;
    abstract get(id: string): Promise<Role | null>;
    abstract list(): Promise<Role[]>;
    abstract existsByCode(code: string): Promise<boolean>;
    abstract assignPermissions(roleId: string, permissionIds: string[], context: TransactionContext): Promise<void>;
    abstract removePermissions(roleId: string, permissionIds: string[], context: TransactionContext): Promise<void>;
}

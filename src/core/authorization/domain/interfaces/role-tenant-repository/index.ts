import type { TransactionContext } from "@/shared/transaction";

import type { Role } from "../../entities";

export abstract class RoleTenantRepository {
    abstract associateRoles(roleIds: string[], tenantId: string, context: TransactionContext): Promise<void>;
    abstract disassociateRoles(roleIds: string[], tenantId: string, context: TransactionContext): Promise<void>;
    abstract getRolesByTenant(tenantId: string): Promise<Role[]>;
}

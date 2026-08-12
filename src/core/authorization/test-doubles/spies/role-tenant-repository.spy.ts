import { type TransactionContext } from "@/shared/transaction";

import { type Role } from "../../domain/entities";

export class RoleTenantRepositorySpy {
    public associateRoles = jest.fn<Promise<void>, [string[], string, TransactionContext]>();
    public disassociateRoles = jest.fn<Promise<void>, [string[], string, TransactionContext]>();
    public getRolesByTenant = jest.fn<Promise<Role[]>, [string]>();
}

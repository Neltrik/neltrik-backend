import { type TransactionContext } from "@/shared/transaction";

import { type Role } from "../../domain/entities";
import { RoleRepository } from "../../domain/interfaces";

export class RoleRepositorySpy extends RoleRepository {
    public create = jest.fn<Promise<void>, [Role]>();
    public update = jest.fn<Promise<void>, [Role]>();
    public get = jest.fn<Promise<Role | null>, [string]>();
    public list = jest.fn<Promise<Role[]>, []>();
    public existsByCode = jest.fn<Promise<boolean>, [string]>();
    public assignPermissions = jest.fn<Promise<void>, [string, string[], TransactionContext]>();
    public removePermissions = jest.fn<Promise<void>, [string, string[], TransactionContext]>();
}

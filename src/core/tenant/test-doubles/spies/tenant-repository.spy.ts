import { type Tenant } from "../../domain/entities";
import { TenantRepository } from "../../domain/interfaces";

export class TenantRepositorySpy extends TenantRepository {
    public create = jest.fn<Promise<void>, [Tenant]>();
    public update = jest.fn<Promise<void>, [Tenant]>();
    public get = jest.fn<Promise<Tenant | null>, [string]>();
    public list = jest.fn<Promise<Tenant[]>, [void]>();
}

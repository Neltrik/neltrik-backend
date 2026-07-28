import { type Tenant } from "../../domain/entities/tenant";
import { TenantRepository } from "../../domain/interfaces/tenant-repository";

export class TenantRepositorySpy extends TenantRepository {
    public create = jest.fn<Promise<void>, [Tenant]>();
    public update = jest.fn<Promise<void>, [Tenant]>();
    public get = jest.fn<Promise<Tenant | null>, [string]>();
}

import { type Tenant } from "../../entities";

export abstract class TenantRepository {
    abstract create(tenant: Tenant): Promise<void>;
    abstract update(tenant: Tenant): Promise<void>;
    abstract get(id: string): Promise<Tenant | null>;
}

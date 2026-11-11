import type { Company } from "../../entities";
import { type FindByTenantParams } from "../../types";

export abstract class CompanyRepository {
    abstract create(company: Company): Promise<Company>;
    abstract findById(id: string): Promise<Company | null>;
    abstract findByTenant(params: FindByTenantParams): Promise<Company[]>;
    abstract findByTenantAndSlug(tenantId: string, slug: string): Promise<Company | null>;
    abstract update(company: Company): Promise<void>;
}

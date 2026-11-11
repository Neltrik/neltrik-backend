import type { Company } from "../../entities";

export abstract class CompanyRepository {
    abstract create(company: Company): Promise<Company>;
    abstract findById(id: string): Promise<Company | null>;
    abstract findByTenant(tenantId: string): Promise<Company[]>;
    abstract findByTenantAndSlug(tenantId: string, slug: string): Promise<Company | null>;
    abstract update(company: Company): Promise<void>;
}

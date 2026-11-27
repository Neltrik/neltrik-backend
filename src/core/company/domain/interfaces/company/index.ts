import { type PaginationInput } from "@/shared/pagination";

import type { Company } from "../../entities";
import { type FindByUserMembershipParams } from "../../types";

export abstract class CompanyRepository {
    abstract create(company: Company): Promise<Company>;
    abstract findById(id: string): Promise<Company | null>;
    abstract findBySlug(slug: string): Promise<Company | null>;
    abstract update(company: Company): Promise<void>;
    abstract delete(id: string): Promise<void>;
    abstract findAll(params: PaginationInput): Promise<Company[]>;
    public abstract findByUserMembership(params: FindByUserMembershipParams): Promise<Company[]>;
}

import { type PaginationInput } from "@/shared/pagination";

import { type Company } from "../../domain/entities";
import { CompanyRepository } from "../../domain/interfaces";
import { type FindByTenantParams } from "../../domain/types";

export class CompanyRepositorySpy extends CompanyRepository {
    public create = jest.fn<Promise<Company>, [Company]>();
    public findById = jest.fn<Promise<Company | null>, [string]>();
    public findByTenant = jest.fn<Promise<Company[]>, [FindByTenantParams]>();
    public findByTenantAndSlug = jest.fn<Promise<Company | null>, [string, string]>();
    public update = jest.fn<Promise<void>, [Company]>();
    public findAll = jest.fn<Promise<Company[]>, [PaginationInput]>();
}

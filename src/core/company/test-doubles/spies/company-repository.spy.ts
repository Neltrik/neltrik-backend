import { type PaginationInput } from "@/shared/pagination";

import { type Company } from "../../domain/entities";
import { CompanyRepository } from "../../domain/interfaces";
import { type FindByUserMembershipParams } from "../../domain/types";

export class CompanyRepositorySpy extends CompanyRepository {
    public create = jest.fn<Promise<Company>, [Company]>();
    public findById = jest.fn<Promise<Company | null>, [string]>();
    public findBySlug = jest.fn<Promise<Company | null>, [string]>();
    public update = jest.fn<Promise<void>, [Company]>();
    public delete = jest.fn<Promise<void>, [string]>();
    public findAll = jest.fn<Promise<Company[]>, [PaginationInput]>();
    public findByUserMembership = jest.fn<Promise<Company[]>, [FindByUserMembershipParams]>();
}

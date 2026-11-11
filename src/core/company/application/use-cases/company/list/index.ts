import { Injectable } from "@nestjs/common";

import { paginate } from "@/shared/pagination";

import { CompanyRepository } from "../../../../domain/interfaces";
import { ListCompaniesInput } from "./input";
import { ListCompaniesOutput } from "./output";

@Injectable()
export class ListCompaniesUseCase {
    constructor(private readonly companyRepository: CompanyRepository) {}

    public async execute(input: ListCompaniesInput): Promise<ListCompaniesOutput> {
        const companies = await this.companyRepository.findByTenant({
            tenantId: input.actorTenantId,
            cursor: input.cursor,
            limit: input.limit,
        });
        const { items, meta } = paginate({
            items: companies,
            limit: input.limit,
            getId: (company) => company.id,
        });
        return { companies: items, meta };
    }
}

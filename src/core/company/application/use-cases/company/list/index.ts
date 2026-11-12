import { Injectable } from "@nestjs/common";

import { TenantApi } from "@/core/tenant/api";
import { paginate } from "@/shared/pagination";

import { CompanyRepository } from "../../../../domain/interfaces";
import { ListCompaniesInput } from "./input";
import { ListCompaniesOutput } from "./output";

@Injectable()
export class ListCompaniesUseCase {
    constructor(
        private readonly tenantApi: TenantApi,
        private readonly companyRepository: CompanyRepository,
    ) {}

    public async execute(input: ListCompaniesInput): Promise<ListCompaniesOutput> {
        const { limit, cursor } = input;
        const isPlatformAdmin = await this.tenantApi.isPlatformTenant(input.actorTenantId);
        const companies = isPlatformAdmin
            ? await this.companyRepository.findAll({ cursor, limit })
            : await this.companyRepository.findByTenant({ tenantId: input.actorTenantId, cursor, limit });
        const { items, meta } = paginate({
            items: companies,
            limit: input.limit,
            getId: (company) => company.id,
        });
        return { companies: items, meta };
    }
}

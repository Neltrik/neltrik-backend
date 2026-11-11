import { Injectable } from "@nestjs/common";

import { TenantApi } from "@/core/tenant/api";

import { CompanyNotFoundError } from "../../../../domain/errors";
import { CompanyRepository } from "../../../../domain/interfaces";
import { SuspendCompanyInput } from "./input";
import { SuspendCompanyOutput } from "./output";

@Injectable()
export class SuspendCompanyUseCase {
    constructor(
        private readonly tenantApi: TenantApi,
        private readonly companyRepository: CompanyRepository,
    ) {}

    public async execute(input: SuspendCompanyInput): Promise<SuspendCompanyOutput> {
        await this.tenantApi.validate(input.actorTenantId);
        const company = await this.companyRepository.findById(input.id);
        if (!company) {
            throw new CompanyNotFoundError();
        }
        company.suspend();
        await this.companyRepository.update(company);
        return {
            id: company.id,
            tenantId: company.tenantId,
            name: company.name,
            slug: company.slug,
            status: company.status,
            createdAt: company.createdAt,
            updatedAt: company.updatedAt,
        };
    }
}

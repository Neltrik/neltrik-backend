import { Injectable } from "@nestjs/common";

import { TenantApi } from "@/core/tenant/api";
import { ForbiddenError } from "@/shared/errors";

import { CompanyNotFoundError } from "../../../../domain/errors";
import { CompanyRepository } from "../../../../domain/interfaces";
import { GetCompanyInput } from "./input";
import { GetCompanyOutput } from "./output";

@Injectable()
export class GetCompanyUseCase {
    constructor(
        private readonly tenantApi: TenantApi,
        private readonly companyRepository: CompanyRepository,
    ) {}

    public async execute(input: GetCompanyInput): Promise<GetCompanyOutput> {
        const company = await this.companyRepository.findById(input.id);
        if (!company) {
            throw new CompanyNotFoundError();
        }
        const isPlatformActor = await this.tenantApi.isPlatformTenant(input.actorTenantId);
        if (!isPlatformActor && company.tenantId !== input.actorTenantId) {
            throw new ForbiddenError();
        }
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

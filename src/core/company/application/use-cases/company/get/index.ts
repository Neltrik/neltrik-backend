import { Injectable } from "@nestjs/common";

import { TenantApi } from "@/core/tenant/api";

import { CompanyNotFoundError } from "../../../../domain/errors";
import { CompanyRepository, MembershipRepository } from "../../../../domain/interfaces";
import { GetCompanyInput } from "./input";
import { GetCompanyOutput } from "./output";

@Injectable()
export class GetCompanyUseCase {
    constructor(
        private readonly tenantApi: TenantApi,
        private readonly companyRepository: CompanyRepository,
        private readonly membershipRepository: MembershipRepository,
    ) {}

    public async execute(input: GetCompanyInput): Promise<GetCompanyOutput> {
        const company = await this.companyRepository.findById(input.id);
        if (!company) {
            throw new CompanyNotFoundError();
        }
        const isPlatformAdmin = await this.tenantApi.isPlatformTenant(input.actorTenantId);
        if (!isPlatformAdmin) {
            const hasMembership = await this.membershipRepository.findActiveByUserAndCompany(
                input.actorUserId,
                company.id,
            );
            if (!hasMembership) {
                throw new CompanyNotFoundError();
            }
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

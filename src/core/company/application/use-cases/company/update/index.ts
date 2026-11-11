import { Injectable } from "@nestjs/common";

import { TenantApi } from "@/core/tenant/api";

import { Company } from "../../../../domain/entities";
import { CompanyNotFoundError, CompanySlugAlreadyExistsError } from "../../../../domain/errors";
import { CompanyRepository } from "../../../../domain/interfaces";
import { CompanySlug } from "../../../../domain/value-objects";
import { UpdateCompanyInput } from "./input";
import { UpdateCompanyOutput } from "./output";

@Injectable()
export class UpdateCompanyUseCase {
    constructor(
        private readonly tenantApi: TenantApi,
        private readonly companyRepository: CompanyRepository,
    ) {}

    public async execute(input: UpdateCompanyInput): Promise<UpdateCompanyOutput> {
        await this.tenantApi.validate(input.actorTenantId);
        const company = await this.companyRepository.findById(input.id);
        if (!company) {
            throw new CompanyNotFoundError();
        }
        if (input.name !== undefined) {
            company.rename(input.name);
        }
        if (input.slug !== undefined) {
            await this.ensureSlugIsAvailable(company, input.slug);
            company.changeSlug(input.slug);
        }
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

    private async ensureSlugIsAvailable(company: Company, slug: string): Promise<void> {
        const slugVO = CompanySlug.create(slug);
        if (slugVO.value === company.slug) {
            return;
        }
        const existing = await this.companyRepository.findByTenantAndSlug(company.tenantId, slugVO.value);
        if (existing) {
            throw new CompanySlugAlreadyExistsError();
        }
    }
}

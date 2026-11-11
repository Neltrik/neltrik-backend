import { Injectable } from "@nestjs/common";

import { TenantApi } from "@/core/tenant/api";
import { IdGenerator } from "@/shared/id-generator";

import { Company } from "../../../../domain/entities";
import { CompanySlugAlreadyExistsError } from "../../../../domain/errors";
import { CompanyRepository } from "../../../../domain/interfaces";
import { CompanySlug } from "../../../../domain/value-objects";
import { CreateCompanyInput } from "./input";
import { CreateCompanyOutput } from "./output";

@Injectable()
export class CreateCompanyUseCase {
    constructor(
        private readonly tenantApi: TenantApi,
        private readonly idGenerator: IdGenerator,
        private readonly companyRepository: CompanyRepository,
    ) {}

    public async execute(input: CreateCompanyInput): Promise<CreateCompanyOutput> {
        await this.tenantApi.validate(input.actorTenantId);
        const slugVO = CompanySlug.create(input.slug);
        const existing = await this.companyRepository.findByTenantAndSlug(input.actorTenantId, slugVO.value);
        if (existing) {
            throw new CompanySlugAlreadyExistsError();
        }
        const now = new Date();
        const company = Company.create({
            id: this.idGenerator.generate(),
            tenantId: input.actorTenantId,
            name: input.name,
            slug: slugVO.value,
            createdAt: now,
        });
        await this.companyRepository.create(company);
        return { id: company.id };
    }
}

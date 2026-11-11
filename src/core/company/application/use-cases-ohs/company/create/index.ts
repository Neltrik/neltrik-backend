import { Injectable } from "@nestjs/common";

import { IdGenerator } from "@/shared/id-generator";

import { Company } from "../../../../domain/entities";
import { CompanyRepository } from "../../../../domain/interfaces";
import { CompanySlug } from "../../../../domain/value-objects";
import { CreateCompanyOhsInput } from "./input";
import { CreateCompanyOhsOutput } from "./output";

@Injectable()
export class CreateCompanyOhsUseCase {
    constructor(
        private readonly idGenerator: IdGenerator,
        private readonly companyRepository: CompanyRepository,
    ) {}

    public async execute(input: CreateCompanyOhsInput): Promise<CreateCompanyOhsOutput> {
        const slugVO = CompanySlug.create(input.slug);
        const now = new Date();
        const company = Company.create({
            id: this.idGenerator.generate(),
            tenantId: input.tenantId,
            name: input.name,
            slug: slugVO.value,
            createdAt: now,
        });
        await this.companyRepository.create(company);
        return { id: company.id };
    }
}

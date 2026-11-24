import { Injectable } from "@nestjs/common";

import { CompanyNotFoundError } from "../../../../domain/errors";
import { CompanyRepository } from "../../../../domain/interfaces";
import { ValidateCompanyAccessInternalUseCase } from "../../../use-cases-internal";
import { GetCompanyInput } from "./input";
import { GetCompanyOutput } from "./output";

@Injectable()
export class GetCompanyUseCase {
    constructor(
        private readonly companyRepository: CompanyRepository,
        private readonly validateCompanyAccessInternalUseCase: ValidateCompanyAccessInternalUseCase,
    ) {}

    public async execute(input: GetCompanyInput): Promise<GetCompanyOutput> {
        const company = await this.companyRepository.findById(input.id);
        if (!company) {
            throw new CompanyNotFoundError();
        }
        await this.validateCompanyAccessInternalUseCase.execute({
            actorTenantId: input.actorTenantId,
            actorUserId: input.actorUserId,
            companyId: company.id,
        });
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

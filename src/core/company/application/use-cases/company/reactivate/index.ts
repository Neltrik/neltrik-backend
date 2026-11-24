import { Injectable } from "@nestjs/common";

import { CompanyNotFoundError } from "../../../../domain/errors";
import { CompanyRepository } from "../../../../domain/interfaces";
import { ValidateCompanyAccessInternalUseCase } from "../../../use-cases-internal";
import { ReactivateCompanyInput } from "./input";
import { ReactivateCompanyOutput } from "./output";

@Injectable()
export class ReactivateCompanyUseCase {
    constructor(
        private readonly companyRepository: CompanyRepository,
        private readonly validateCompanyAccessInternalUseCase: ValidateCompanyAccessInternalUseCase,
    ) {}

    public async execute(input: ReactivateCompanyInput): Promise<ReactivateCompanyOutput> {
        const company = await this.companyRepository.findById(input.id);
        if (!company) {
            throw new CompanyNotFoundError();
        }
        await this.validateCompanyAccessInternalUseCase.execute({
            actorTenantId: input.actorTenantId,
            actorUserId: input.actorUserId,
            companyId: company.id,
        });
        company.reactivate();
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

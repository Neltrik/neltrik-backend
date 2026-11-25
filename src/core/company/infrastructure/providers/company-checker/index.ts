import { Injectable } from "@nestjs/common";

import { CompanyChecker } from "@/shared/authorization";

import { CompanyRepository } from "../../../domain/interfaces";

@Injectable()
export class CompanyCheckerProvider extends CompanyChecker {
    constructor(private readonly companyRepository: CompanyRepository) {
        super();
    }

    public async isActive(companyId: string): Promise<boolean> {
        const company = await this.companyRepository.findById(companyId);
        return company?.isActive() ?? false;
    }
}

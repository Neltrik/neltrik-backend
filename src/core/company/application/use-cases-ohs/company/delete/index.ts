import { Injectable } from "@nestjs/common";

import { CompanyNotFoundError } from "../../../../domain/errors";
import { CompanyRepository } from "../../../../domain/interfaces";

@Injectable()
export class DeleteCompanyOhsUseCase {
    constructor(private readonly companyRepository: CompanyRepository) {}

    public async execute(id: string): Promise<void> {
        const company = await this.companyRepository.findById(id);
        if (!company) {
            throw new CompanyNotFoundError();
        }
        await this.companyRepository.delete(id);
    }
}

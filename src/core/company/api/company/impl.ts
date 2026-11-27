import { Injectable } from "@nestjs/common";

import { CreateCompanyOhsUseCase, DeleteCompanyOhsUseCase } from "../../application/use-cases-ohs";
import { CompanyApi } from "./contract";
import type { CreateCompanyResponseDto, CreateCompanyResultDto } from "./result.dto";

@Injectable()
export class CompanyApiImpl extends CompanyApi {
    constructor(
        private readonly createCompanyOhsUseCase: CreateCompanyOhsUseCase,
        private readonly deleteCompanyOhsUseCase: DeleteCompanyOhsUseCase,
    ) {
        super();
    }

    public async create(input: CreateCompanyResultDto): Promise<CreateCompanyResponseDto> {
        const result = await this.createCompanyOhsUseCase.execute(input);
        return { id: result.id };
    }

    public async delete(id: string): Promise<void> {
        await this.deleteCompanyOhsUseCase.execute(id);
    }
}

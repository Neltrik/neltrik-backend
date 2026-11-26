import { Injectable } from "@nestjs/common";

import {
    type CreateCompanyOhsInput,
    type CreateCompanyOhsOutput,
    CreateCompanyOhsUseCase,
} from "../../application/use-cases-ohs";
import { CompanyApi } from "./contract";

@Injectable()
export class CompanyApiImpl extends CompanyApi {
    constructor(private readonly createCompanyOhsUseCase: CreateCompanyOhsUseCase) {
        super();
    }

    public async create(input: CreateCompanyOhsInput): Promise<CreateCompanyOhsOutput> {
        const result = await this.createCompanyOhsUseCase.execute(input);
        return { id: result.id };
    }
}

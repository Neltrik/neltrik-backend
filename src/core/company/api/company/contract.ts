import { type CreateCompanyOhsInput, type CreateCompanyOhsOutput } from "../../application/use-cases-ohs";

export abstract class CompanyApi {
    public abstract create(input: CreateCompanyOhsInput): Promise<CreateCompanyOhsOutput>;
}

import type { CreateCompanyResponseDto, CreateCompanyResultDto } from "./result.dto";

export abstract class CompanyApi {
    public abstract create(input: CreateCompanyResultDto): Promise<CreateCompanyResponseDto>;
    public abstract delete(id: string): Promise<void>;
}

import { type TenantResultDto } from "./result.dto";

export abstract class TenantApi {
    public abstract validate(id: string): Promise<void>;
    public abstract getById(id: string): Promise<TenantResultDto>;
    public abstract isPlatformTenant(id: string): Promise<boolean>;
    public abstract list(): Promise<TenantResultDto[]>;
}

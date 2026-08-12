export abstract class TenantApi {
    public abstract validate(id: string): Promise<void>;
    public abstract isPlatformTenant(id: string): Promise<boolean>;
}

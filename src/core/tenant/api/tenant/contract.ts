export abstract class TenantApi {
    public abstract validate(id: string): Promise<void>;
}

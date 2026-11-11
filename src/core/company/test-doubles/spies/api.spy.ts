import { TenantApi, type TenantResultDto } from "@/core/tenant/api";

export class TenantApiSpy extends TenantApi {
    public validate = jest.fn<Promise<void>, [string]>();
    public getById = jest.fn<Promise<TenantResultDto>, [string]>();
    public isPlatformTenant = jest.fn<Promise<boolean>, [string]>();
    public list = jest.fn<Promise<TenantResultDto[]>, [void]>();
}

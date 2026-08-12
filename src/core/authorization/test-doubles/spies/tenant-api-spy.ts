import { TenantApi } from "@/core/tenant/api";

export class TenantApiSpy extends TenantApi {
    public validate = jest.fn<Promise<void>, [string]>();
    public isPlatformTenant = jest.fn<Promise<boolean>, [string]>();
}

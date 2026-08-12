export class TenantApiSpy {
    public validate = jest.fn<Promise<void>, [string]>();
    public isPlatformTenant = jest.fn<Promise<boolean>, [string]>();
}

export class TenantApiSpy {
    public validate = jest.fn<Promise<void>, [string]>();
}

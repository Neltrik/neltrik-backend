export class UserApiSpy {
    public validateUserById = jest.fn<Promise<void>, [string]>();
    public validateEmail = jest.fn<Promise<void>, [string]>();
}

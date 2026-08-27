import { TokenProvider } from "../../infrastructure/providers";

export class TokenProviderSpy extends TokenProvider {
    constructor() {
        super({} as never);
    }

    public override generateAccessToken = jest.fn();
    public override generateRefreshToken = jest.fn();
    public override hashRefreshToken = jest.fn();
    public override compareRefreshToken = jest.fn();
    public override calculateRefreshTokenExpiration = jest.fn();
    public override calculateAccessTokenExpiration = jest.fn();
}

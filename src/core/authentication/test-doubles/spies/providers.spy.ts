import { Sha256Hasher, TokenProvider } from "../../infrastructure/providers";
import { EmailPasswordProviderStrategy, ProviderAuthenticationStrategyFactory } from "../../infrastructure/strategies";

export class ProviderAuthenticationStrategySpy extends EmailPasswordProviderStrategy {
    public override authenticate = jest.fn();
    public override register = jest.fn();
}

export class ProviderAuthenticationStrategyFactorySpy extends ProviderAuthenticationStrategyFactory {
    public readonly strategy: ProviderAuthenticationStrategySpy;
    constructor() {
        const strategy = new ProviderAuthenticationStrategySpy();
        super(strategy);
        this.strategy = strategy;
    }
    public override create = jest.fn(() => this.strategy);
}

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

export class Sha256HasherSpy extends Sha256Hasher {
    constructor() {
        super();
    }

    public override hash = jest.fn();
}

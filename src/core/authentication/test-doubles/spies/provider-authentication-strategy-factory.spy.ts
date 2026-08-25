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

import { Injectable } from "@nestjs/common";

import { UnsupportedProviderError } from "../../../../domain/errors";
import { ProviderAuthenticationStrategy } from "../contract";
import { EmailPasswordProviderStrategy } from "../email-password";

@Injectable()
export class ProviderAuthenticationStrategyFactory {
    constructor(private readonly emailPasswordStrategy: EmailPasswordProviderStrategy) {}

    public create(provider: string): ProviderAuthenticationStrategy {
        switch (provider) {
            case "email-password":
                return this.emailPasswordStrategy;
            default:
                throw new UnsupportedProviderError();
        }
    }
}

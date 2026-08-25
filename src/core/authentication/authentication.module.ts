import { Module } from "@nestjs/common";

import { AuthenticationAccountRepository } from "./domain/interfaces";
import { PrismaAuthenticationAccountRepository } from "./infrastructure/repositories";
import { EmailPasswordProviderStrategy, ProviderAuthenticationStrategyFactory } from "./infrastructure/strategies";

@Module({
    providers: [
        EmailPasswordProviderStrategy,
        ProviderAuthenticationStrategyFactory,
        {
            provide: AuthenticationAccountRepository,
            useClass: PrismaAuthenticationAccountRepository,
        },
    ],
})
export class AuthenticationModule {}

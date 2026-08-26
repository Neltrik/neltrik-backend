import { Module } from "@nestjs/common";

import { IdentityModule } from "@/core/identity/identity.module";
import { TenantModule } from "@/core/tenant/tenant.module";

import { GetAccountByEmailUseCase, GetAccountByUserIdUseCase, RegisterUseCase } from "./application/use-cases";
import { AuthenticationAccountRepository } from "./domain/interfaces";
import { PrismaAuthenticationAccountRepository } from "./infrastructure/repositories";
import { EmailPasswordProviderStrategy, ProviderAuthenticationStrategyFactory } from "./infrastructure/strategies";

@Module({
    providers: [
        GetAccountByEmailUseCase,
        GetAccountByUserIdUseCase,
        RegisterUseCase,
        EmailPasswordProviderStrategy,
        ProviderAuthenticationStrategyFactory,
        {
            provide: AuthenticationAccountRepository,
            useClass: PrismaAuthenticationAccountRepository,
        },
    ],
    imports: [IdentityModule, TenantModule],
})
export class AuthenticationModule {}

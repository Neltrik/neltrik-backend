import { Module } from "@nestjs/common";

import { AuthorizationModule } from "@/core/authorization/authorization.module";
import { IdentityModule } from "@/core/identity/identity.module";
import { TenantModule } from "@/core/tenant/tenant.module";

import { GetAccountByEmailUseCase, GetAccountByUserIdUseCase, RegisterUseCase } from "./application/use-cases";
import { AuthenticationAccountRepository, AuthenticationSessionRepository } from "./domain/interfaces";
import {
    PrismaAuthenticationAccountRepository,
    PrismaAuthenticationSessionRepository,
} from "./infrastructure/repositories";
import { EmailPasswordProviderStrategy, ProviderAuthenticationStrategyFactory } from "./infrastructure/strategies";
import { AccountController } from "./presentation/controllers";

@Module({
    controllers: [AccountController],
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
        {
            provide: AuthenticationSessionRepository,
            useClass: PrismaAuthenticationSessionRepository,
        },
    ],
    imports: [AuthorizationModule, IdentityModule, TenantModule],
})
export class AuthenticationModule {}

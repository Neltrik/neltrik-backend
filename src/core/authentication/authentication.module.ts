import { Module } from "@nestjs/common";

import { IdentityModule } from "@/core/identity/identity.module";
import { TenantModule } from "@/core/tenant/tenant.module";

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
    imports: [IdentityModule, TenantModule],
})
export class AuthenticationModule {}

import { Module } from "@nestjs/common";

import { IdentityModule } from "@/core/identity/identity.module";

import { CreateAuthenticationAccountUseCase } from "./application/use-cases";
import { AuthenticationAccountRepository } from "./domain/interfaces";
import { PrismaAuthenticationAccountRepository } from "./infrastructure/repositories";

@Module({
    providers: [
        CreateAuthenticationAccountUseCase,
        {
            provide: AuthenticationAccountRepository,
            useClass: PrismaAuthenticationAccountRepository,
        },
    ],
    imports: [IdentityModule],
})
export class AuthenticationModule {}

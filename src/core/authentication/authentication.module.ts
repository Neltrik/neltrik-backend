import { Module } from "@nestjs/common";

import { IdentityModule } from "@/core/identity/identity.module";

import {
    ChangeAuthenticationAccountPasswordUseCase,
    CreateAuthenticationAccountUseCase,
    GetAuthenticationAccountByEmailUseCase,
    GetAuthenticationAccountByUserIdUseCase,
} from "./application/use-cases";
import { AuthenticationAccountRepository } from "./domain/interfaces";
import { PrismaAuthenticationAccountRepository } from "./infrastructure/repositories";

@Module({
    providers: [
        ChangeAuthenticationAccountPasswordUseCase,
        CreateAuthenticationAccountUseCase,
        GetAuthenticationAccountByEmailUseCase,
        GetAuthenticationAccountByUserIdUseCase,
        {
            provide: AuthenticationAccountRepository,
            useClass: PrismaAuthenticationAccountRepository,
        },
    ],
    imports: [IdentityModule],
})
export class AuthenticationModule {}

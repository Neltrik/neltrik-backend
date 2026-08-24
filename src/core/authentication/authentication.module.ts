import { Module } from "@nestjs/common";

import { AuthenticationAccountRepository } from "./domain/interfaces";
import { PrismaAuthenticationAccountRepository } from "./infrastructure/repositories";

@Module({
    providers: [
        {
            provide: AuthenticationAccountRepository,
            useClass: PrismaAuthenticationAccountRepository,
        },
    ],
})
export class AuthenticationModule {}

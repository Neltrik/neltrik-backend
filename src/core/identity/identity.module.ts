import { Module } from "@nestjs/common";

import { UserRepository } from "./domain/interfaces";
import { PrismaUserRepository } from "./infrastructure/repositories";

@Module({
    providers: [
        {
            provide: UserRepository,
            useClass: PrismaUserRepository,
        },
    ],
})
export class IdentityModule {}

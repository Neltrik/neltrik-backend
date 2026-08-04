import { Module } from "@nestjs/common";

import { RoleRepository } from "./domain/interfaces";
import { PrismaRoleRepository } from "./infrastructure/repositories";

@Module({
    providers: [
        {
            provide: RoleRepository,
            useClass: PrismaRoleRepository,
        },
    ],
})
export class AuthorizationModule {}

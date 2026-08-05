import { Module } from "@nestjs/common";

import { CreateRoleUseCase, GetRolesUseCase, GetRoleUseCase, UpdateRoleUseCase } from "./application/use-cases";
import { RoleRepository } from "./domain/interfaces";
import { PrismaRoleRepository } from "./infrastructure/repositories";
import { RoleController } from "./presentation/controllers/role";

@Module({
    controllers: [RoleController],
    providers: [
        CreateRoleUseCase,
        GetRolesUseCase,
        GetRoleUseCase,
        UpdateRoleUseCase,
        {
            provide: RoleRepository,
            useClass: PrismaRoleRepository,
        },
    ],
})
export class AuthorizationModule {}

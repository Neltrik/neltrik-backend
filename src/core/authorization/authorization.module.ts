import { Module } from "@nestjs/common";

import {
    CreatePermissionUseCase,
    CreateRoleUseCase,
    GetPermissionsUseCase,
    GetRolesUseCase,
    UpdatePermissionUseCase,
    UpdateRoleUseCase,
} from "./application/use-cases";
import { PermissionRepository, RoleRepository } from "./domain/interfaces";
import { PrismaPermissionRepository, PrismaRoleRepository } from "./infrastructure/repositories";
import { RoleController } from "./presentation/controllers/role";

@Module({
    controllers: [RoleController],
    providers: [
        CreateRoleUseCase,
        GetRolesUseCase,
        UpdateRoleUseCase,
        CreatePermissionUseCase,
        GetPermissionsUseCase,
        UpdatePermissionUseCase,
        {
            provide: RoleRepository,
            useClass: PrismaRoleRepository,
        },
        {
            provide: PermissionRepository,
            useClass: PrismaPermissionRepository,
        },
    ],
})
export class AuthorizationModule {}

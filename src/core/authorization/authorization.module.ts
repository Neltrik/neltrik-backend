import { Module } from "@nestjs/common";

import {
    CreatePermissionUseCase,
    CreateRoleUseCase,
    ListPermissionsUseCase,
    ListRolesUseCase,
    UpdatePermissionUseCase,
    UpdateRoleUseCase,
} from "./application/use-cases";
import { PermissionRepository, RoleRepository } from "./domain/interfaces";
import { PrismaPermissionRepository, PrismaRoleRepository } from "./infrastructure/repositories";
import { PermissionController, RoleController } from "./presentation/controllers";

@Module({
    controllers: [PermissionController, RoleController],
    providers: [
        CreateRoleUseCase,
        ListRolesUseCase,
        UpdateRoleUseCase,
        CreatePermissionUseCase,
        ListPermissionsUseCase,
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

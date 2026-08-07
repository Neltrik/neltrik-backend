import { Module } from "@nestjs/common";

import {
    CreatePermissionUseCase,
    CreateRoleUseCase,
    CreateTenantRoleConfigurationUseCase,
    DeleteTenantRoleConfigurationUseCase,
    ListPermissionsUseCase,
    ListRolesUseCase,
    ListTenantRoleConfigurationUseCase,
    UpdatePermissionUseCase,
    UpdateRoleUseCase,
    UpdateTenantRoleConfigurationUseCase,
} from "./application/use-cases";
import { PermissionRepository, RoleRepository, TenantRoleConfigurationRepository } from "./domain/interfaces";
import {
    PrismaPermissionRepository,
    PrismaRoleRepository,
    PrismaTenantRoleConfigurationRepository,
} from "./infrastructure/repositories";
import { PermissionController, RoleController, TenantRoleConfigurationController } from "./presentation/controllers";

@Module({
    controllers: [PermissionController, RoleController, TenantRoleConfigurationController],
    providers: [
        CreatePermissionUseCase,
        CreateRoleUseCase,
        CreateTenantRoleConfigurationUseCase,
        DeleteTenantRoleConfigurationUseCase,
        ListPermissionsUseCase,
        ListRolesUseCase,
        ListTenantRoleConfigurationUseCase,
        UpdatePermissionUseCase,
        UpdateRoleUseCase,
        UpdateTenantRoleConfigurationUseCase,
        {
            provide: RoleRepository,
            useClass: PrismaRoleRepository,
        },
        {
            provide: PermissionRepository,
            useClass: PrismaPermissionRepository,
        },
        {
            provide: TenantRoleConfigurationRepository,
            useClass: PrismaTenantRoleConfigurationRepository,
        },
    ],
})
export class AuthorizationModule {}

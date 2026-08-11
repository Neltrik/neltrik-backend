import { Module } from "@nestjs/common";

import {
    AssignPermissionsToRoleUseCase,
    CreatePermissionUseCase,
    CreateRoleUseCase,
    CreateTenantRoleConfigurationUseCase,
    DeleteTenantRoleConfigurationUseCase,
    GetPermissionsByRoleUseCase,
    ListPermissionsUseCase,
    ListRolesUseCase,
    ListTenantRoleConfigurationUseCase,
    RemovePermissionsFromRoleUseCase,
    UpdatePermissionUseCase,
    UpdateRoleUseCase,
    UpdateTenantRoleConfigurationUseCase,
} from "./application/use-cases";
import {
    PermissionRepository,
    RoleRepository,
    RoleTenantRepository,
    TenantRoleConfigurationRepository,
} from "./domain/interfaces";
import {
    PrismaPermissionRepository,
    PrismaRoleRepository,
    PrismaRoleTenantRepository,
    PrismaTenantRoleConfigurationRepository,
} from "./infrastructure/repositories";
import { PermissionController, RoleController, TenantRoleConfigurationController } from "./presentation/controllers";

@Module({
    controllers: [PermissionController, RoleController, TenantRoleConfigurationController],
    providers: [
        AssignPermissionsToRoleUseCase,
        CreatePermissionUseCase,
        CreateRoleUseCase,
        CreateTenantRoleConfigurationUseCase,
        DeleteTenantRoleConfigurationUseCase,
        GetPermissionsByRoleUseCase,
        ListPermissionsUseCase,
        ListRolesUseCase,
        ListTenantRoleConfigurationUseCase,
        RemovePermissionsFromRoleUseCase,
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
            provide: RoleTenantRepository,
            useClass: PrismaRoleTenantRepository,
        },
        {
            provide: TenantRoleConfigurationRepository,
            useClass: PrismaTenantRoleConfigurationRepository,
        },
    ],
})
export class AuthorizationModule {}

import { Module } from "@nestjs/common";

import { TenantModule } from "@/core/tenant/tenant.module";

import { AuthorizationApi, AuthorizationApiImpl } from "./api";
import {
    AssignPermissionsToRoleUseCase,
    AssociateRolesToTenantUseCase,
    CreatePermissionUseCase,
    CreateRoleUseCase,
    CreateTenantRoleConfigurationUseCase,
    DeleteTenantRoleConfigurationUseCase,
    DisassociateRolesFromTenantUseCase,
    GetPermissionsByRoleUseCase,
    GetRolesByTenantUseCase,
    ListPermissionsUseCase,
    ListRolesUseCase,
    ListTenantRoleConfigurationUseCase,
    RemovePermissionsFromRoleUseCase,
    UpdatePermissionUseCase,
    UpdateRoleUseCase,
    UpdateTenantRoleConfigurationUseCase,
} from "./application/use-cases";
import { GetRolesByTenantOhsUseCase } from "./application/use-cases-ohs";
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
import {
    PermissionController,
    RoleController,
    RoleTenantController,
    TenantRoleConfigurationController,
} from "./presentation/controllers";

@Module({
    controllers: [PermissionController, RoleController, RoleTenantController, TenantRoleConfigurationController],
    providers: [
        AssignPermissionsToRoleUseCase,
        AssociateRolesToTenantUseCase,
        CreatePermissionUseCase,
        CreateRoleUseCase,
        CreateTenantRoleConfigurationUseCase,
        DeleteTenantRoleConfigurationUseCase,
        DisassociateRolesFromTenantUseCase,
        GetPermissionsByRoleUseCase,
        GetRolesByTenantUseCase,
        ListPermissionsUseCase,
        ListRolesUseCase,
        ListTenantRoleConfigurationUseCase,
        RemovePermissionsFromRoleUseCase,
        UpdatePermissionUseCase,
        UpdateRoleUseCase,
        UpdateTenantRoleConfigurationUseCase,
        GetRolesByTenantOhsUseCase,
        {
            provide: AuthorizationApi,
            useClass: AuthorizationApiImpl,
        },
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
    imports: [TenantModule],
    exports: [AuthorizationApi],
})
export class AuthorizationModule {}

import { Module } from "@nestjs/common";

import { TenantModule } from "@/core/tenant/tenant.module";

import {
    AuthorizationPolicyApi,
    AuthorizationPolicyApiImpl,
    AuthorizationRoleApi,
    AuthorizationRoleApiImpl,
} from "./api";
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
    GetRoleUseCase,
    ListPermissionsUseCase,
    ListRolesUseCase,
    ListTenantRoleConfigurationUseCase,
    RemovePermissionsFromRoleUseCase,
    UpdatePermissionUseCase,
    UpdateRoleUseCase,
    UpdateTenantRoleConfigurationUseCase,
} from "./application/use-cases";
import { CanSuspendUserPolicyOhsUseCase, GetRolesByTenantOhsUseCase } from "./application/use-cases-ohs";
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
    RolePermissionsController,
    RoleTenantController,
    TenantRoleConfigurationController,
} from "./presentation/controllers";

@Module({
    controllers: [
        PermissionController,
        RoleController,
        RolePermissionsController,
        RoleTenantController,
        TenantRoleConfigurationController,
    ],
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
        GetRoleUseCase,
        ListPermissionsUseCase,
        ListRolesUseCase,
        ListTenantRoleConfigurationUseCase,
        RemovePermissionsFromRoleUseCase,
        UpdatePermissionUseCase,
        UpdateRoleUseCase,
        UpdateTenantRoleConfigurationUseCase,
        CanSuspendUserPolicyOhsUseCase,
        GetRolesByTenantOhsUseCase,
        {
            provide: AuthorizationRoleApi,
            useClass: AuthorizationRoleApiImpl,
        },
        {
            provide: AuthorizationPolicyApi,
            useClass: AuthorizationPolicyApiImpl,
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
    exports: [AuthorizationRoleApi, AuthorizationPolicyApi],
})
export class AuthorizationModule {}

import { forwardRef, Module } from "@nestjs/common";

import { IdentityModule } from "@/core/identity/identity.module";
import { TenantModule } from "@/core/tenant/tenant.module";
import { PermissionChecker } from "@/shared/authorization";

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
    UserHasPermissionUseCase,
} from "./application/use-cases";
import {
    CanAssignRoleToTenantOhsUseCase,
    CanSuspendUserPolicyOhsUseCase,
    GetRoleOhsUseCase,
    GetRolesByTenantOhsUseCase,
} from "./application/use-cases-ohs";
import {
    PermissionRepository,
    RoleRepository,
    RoleTenantRepository,
    TenantRoleConfigurationRepository,
} from "./domain/interfaces";
import { PermissionCheckerProvider } from "./infrastructure/providers";
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
        UserHasPermissionUseCase,
        CanAssignRoleToTenantOhsUseCase,
        CanSuspendUserPolicyOhsUseCase,
        GetRoleOhsUseCase,
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
        {
            provide: PermissionChecker,
            useClass: PermissionCheckerProvider,
        },
    ],
    imports: [forwardRef(() => IdentityModule), TenantModule],
    exports: [AuthorizationRoleApi, AuthorizationPolicyApi, PermissionChecker],
})
export class AuthorizationModule {}

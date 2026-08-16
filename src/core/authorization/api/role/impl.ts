import { Injectable } from "@nestjs/common";

import {
    CanAssignRoleToTenantOhsUseCase,
    CanAssignRoleToTenantOhsUseCaseInput,
    GetRoleOhsUseCase,
    GetRolesByTenantOhsUseCase,
} from "../../application/use-cases-ohs";
import { AuthorizationRoleApi } from "./contract";
import type { RoleResultDto } from "./result.dto";

@Injectable()
export class AuthorizationRoleApiImpl extends AuthorizationRoleApi {
    constructor(
        private readonly canAssignRoleToTenantOhsUseCase: CanAssignRoleToTenantOhsUseCase,
        private readonly getRoleOhsUseCase: GetRoleOhsUseCase,
        private readonly getRolesByTenantOhsUseCase: GetRolesByTenantOhsUseCase,
    ) {
        super();
    }

    public async getRolesByTenantId(tenantId: string): Promise<RoleResultDto[]> {
        const roles = await this.getRolesByTenantOhsUseCase.execute(tenantId);
        return roles.map((role) => ({
            id: role.id,
            code: role.code,
            defaultDisplayName: role.defaultDisplayName,
            description: role.description,
            scope: role.scope,
        }));
    }

    public async validate(id: string): Promise<void> {
        await this.getRoleOhsUseCase.execute(id);
    }

    public async validateForTenant(input: CanAssignRoleToTenantOhsUseCaseInput): Promise<void> {
        await this.canAssignRoleToTenantOhsUseCase.execute(input);
    }

    public async getRoleById(roleId: string): Promise<Omit<RoleResultDto, "defaultDisplayName" | "description">> {
        const role = await this.getRoleOhsUseCase.execute(roleId);
        return { id: role.id, code: role.code, scope: role.scope };
    }
}

import { Injectable } from "@nestjs/common";

import { GetRolesByTenantOhsUseCase } from "../../application/use-cases-ohs";
import { AuthorizationRoleApi } from "./contract";
import type { RoleResultDto } from "./result.dto";

@Injectable()
export class AuthorizationRoleApiImpl extends AuthorizationRoleApi {
    constructor(private readonly getRolesByTenantOhsUseCase: GetRolesByTenantOhsUseCase) {
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
}

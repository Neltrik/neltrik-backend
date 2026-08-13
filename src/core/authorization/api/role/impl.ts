import { Injectable } from "@nestjs/common";

import { GetRolesByTenantOhsUseCase } from "../../application/use-cases-ohs";
import { AuthorizationApi } from "./contract";
import type { RoleResultDto } from "./result.dto";

@Injectable()
export class AuthorizationApiImpl extends AuthorizationApi {
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

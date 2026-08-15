import { type RoleResultDto } from "./result.dto";

export abstract class AuthorizationRoleApi {
    public abstract getRolesByTenantId(tenantId: string): Promise<RoleResultDto[]>;
}

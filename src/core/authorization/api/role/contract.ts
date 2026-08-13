import { type RoleResultDto } from "./result.dto";

export abstract class AuthorizationApi {
    public abstract getRolesByTenantId(tenantId: string): Promise<RoleResultDto[]>;
}

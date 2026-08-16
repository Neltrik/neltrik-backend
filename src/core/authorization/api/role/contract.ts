import { type CanAssignRoleToTenantOhsUseCaseInput } from "../../application/use-cases-ohs";
import { type RoleResultDto } from "./result.dto";

export abstract class AuthorizationRoleApi {
    public abstract getRolesByTenantId(tenantId: string): Promise<RoleResultDto[]>;
    public abstract validate(id: string): Promise<void>;
    public abstract validateForTenant(input: CanAssignRoleToTenantOhsUseCaseInput): Promise<void>;
    public abstract getRoleById(roleId: string): Promise<Omit<RoleResultDto, "defaultDisplayName" | "description">>;
}

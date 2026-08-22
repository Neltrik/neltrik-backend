import type { RoleResultDto } from "@/core/authorization/api";

import type { Tenant } from "../../../../../domain/entities";

export interface GetTenantOutput {
    tenant: Tenant;
    roles: RoleResultDto[];
}

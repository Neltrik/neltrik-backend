import { Injectable } from "@nestjs/common";

import type { Role } from "../../../../domain/entities";
import { RoleTenantRepository } from "../../../../domain/interfaces";

@Injectable()
export class GetRolesByTenantOhsUseCase {
    constructor(private readonly roleTenantRepository: RoleTenantRepository) {}

    public async execute(tenantId: string): Promise<Role[]> {
        const roles = await this.roleTenantRepository.getRolesByTenant(tenantId);
        return roles;
    }
}

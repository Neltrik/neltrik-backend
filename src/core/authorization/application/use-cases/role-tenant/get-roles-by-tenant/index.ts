import { Injectable } from "@nestjs/common";

import { TenantApi } from "@/core/tenant/api";

import type { Role } from "../../../../domain/entities";
import { RoleTenantRepository } from "../../../../domain/interfaces";

@Injectable()
export class GetRolesByTenantUseCase {
    constructor(
        private readonly roleTenantRepository: RoleTenantRepository,
        private readonly tenantApi: TenantApi,
    ) {}

    public async execute(tenantId: string): Promise<Role[]> {
        await this.tenantApi.validate(tenantId);
        const roles = await this.roleTenantRepository.getRolesByTenant(tenantId);
        return roles;
    }
}

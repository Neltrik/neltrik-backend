import { Injectable } from "@nestjs/common";

import { RoleTenantRepository, TenantRoleConfigurationRepository } from "../../../../domain/interfaces";
import { GetRolesByTenantOhsOutput } from "./output";

@Injectable()
export class GetRolesByTenantOhsUseCase {
    constructor(
        private readonly roleTenantRepository: RoleTenantRepository,
        private readonly tenantRoleConfigurationRepository: TenantRoleConfigurationRepository,
    ) {}

    public async execute(tenantId: string): Promise<GetRolesByTenantOhsOutput[]> {
        const roles = await this.roleTenantRepository.getRolesByTenant(tenantId);
        const configurations = await this.tenantRoleConfigurationRepository.list(tenantId);
        return roles.map((role) => {
            const configuration = configurations.find((item) => item.roleId === role.id);
            return {
                id: role.id,
                code: role.code,
                defaultDisplayName: configuration?.displayName.value ?? role.defaultDisplayName,
                description: role.description,
                scope: role.scope,
            };
        });
    }
}

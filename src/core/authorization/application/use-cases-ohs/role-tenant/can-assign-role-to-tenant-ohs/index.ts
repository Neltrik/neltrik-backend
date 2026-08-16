import { Injectable } from "@nestjs/common";

import { RoleNotEnabledForTenantError } from "../../../../domain/errors";
import { RoleTenantRepository } from "../../../../domain/interfaces";
import { CanAssignRoleToTenantOhsUseCaseInput } from "./input";

@Injectable()
export class CanAssignRoleToTenantOhsUseCase {
    constructor(private readonly roleTenantRepository: RoleTenantRepository) {}

    public async execute(input: CanAssignRoleToTenantOhsUseCaseInput): Promise<void> {
        const roles = await this.roleTenantRepository.getRolesByTenant(input.tenantId);
        const isRoleEnabled = roles.some((role) => role.id === input.roleId);
        if (!isRoleEnabled) {
            throw new RoleNotEnabledForTenantError();
        }
    }
}

export type { CanAssignRoleToTenantOhsUseCaseInput };

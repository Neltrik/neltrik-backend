import { Injectable } from "@nestjs/common";

import { TenantApi } from "@/core/tenant/api";
import { TransactionManager } from "@/shared/transaction";

import { InvalidRoleScopeError, RoleNotFoundError } from "../../../../domain/errors";
import { RoleRepository, RoleTenantRepository } from "../../../../domain/interfaces";
import { AssociateRolesToTenantInput } from "./input";
import { AssociateRolesToTenantOutput } from "./output";

@Injectable()
export class AssociateRolesToTenantUseCase {
    constructor(
        private readonly roleRepository: RoleRepository,
        private readonly roleTenantRepository: RoleTenantRepository,
        private readonly tenantApi: TenantApi,
        private readonly transactionManager: TransactionManager,
    ) {}

    public async execute(input: AssociateRolesToTenantInput): Promise<AssociateRolesToTenantOutput> {
        const roleIds = [...new Set(input.roleIds)];
        return this.transactionManager.execute(async (context) => {
            await this.tenantApi.validate(input.tenantId);
            const roles = await this.roleRepository.getByIds(roleIds);
            if (roles.length !== roleIds.length) {
                throw new RoleNotFoundError();
            }
            const isPlatformTenant = await this.tenantApi.isPlatformTenant(input.tenantId);
            const hasInvalidPlatformRole = roles.some((role) => role.scope === "PLATFORM" && !isPlatformTenant);
            if (hasInvalidPlatformRole) {
                throw new InvalidRoleScopeError();
            }
            await this.roleTenantRepository.associateRoles(roleIds, input.tenantId, context);
            return { tenantId: input.tenantId, roleIds };
        });
    }
}

export type { AssociateRolesToTenantInput };

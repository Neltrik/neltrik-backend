import { Injectable } from "@nestjs/common";

import { TenantApi } from "@/core/tenant/api";
import { TransactionManager } from "@/shared/transaction";

import { CannotManageRoleTenantError, InvalidRoleScopeError, RoleNotFoundError } from "../../../../domain/errors";
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
            const isPlatformActor = await this.tenantApi.isPlatformTenant(input.actorTenantId);
            if (!isPlatformActor) {
                throw new CannotManageRoleTenantError();
            }
            await this.tenantApi.validate(input.targetTenantId);
            const roles = await this.roleRepository.getByIds(roleIds);
            if (roles.length !== roleIds.length) {
                throw new RoleNotFoundError();
            }
            const isPlatformTenant = await this.tenantApi.isPlatformTenant(input.targetTenantId);
            const hasInvalidPlatformRole = roles.some((role) => role.scope === "PLATFORM" && !isPlatformTenant);
            if (hasInvalidPlatformRole) {
                throw new InvalidRoleScopeError();
            }
            await this.roleTenantRepository.associateRoles(roleIds, input.targetTenantId, context);
            return { tenantId: input.targetTenantId, roleIds };
        });
    }
}

export type { AssociateRolesToTenantInput };

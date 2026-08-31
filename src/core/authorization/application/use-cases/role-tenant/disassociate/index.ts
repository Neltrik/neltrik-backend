import { Injectable } from "@nestjs/common";

import { TenantApi } from "@/core/tenant/api";
import { TransactionManager } from "@/shared/transaction";

import { CannotManageRoleTenantError } from "../../../../domain/errors";
import { RoleTenantRepository } from "../../../../domain/interfaces";
import { DisassociateRolesFromTenantInput } from "./input";
import { DisassociateRolesFromTenantOutput } from "./output";

@Injectable()
export class DisassociateRolesFromTenantUseCase {
    constructor(
        private readonly roleTenantRepository: RoleTenantRepository,
        private readonly tenantApi: TenantApi,
        private readonly transactionManager: TransactionManager,
    ) {}

    public async execute(input: DisassociateRolesFromTenantInput): Promise<DisassociateRolesFromTenantOutput> {
        const roleIds = [...new Set(input.roleIds)];
        return this.transactionManager.execute(async (context) => {
            const isPlatformActor = await this.tenantApi.isPlatformTenant(input.actorTenantId);
            if (!isPlatformActor) {
                throw new CannotManageRoleTenantError();
            }
            await this.tenantApi.validate(input.targetTenantId);
            await this.roleTenantRepository.disassociateRoles(roleIds, input.targetTenantId, context);
            return { tenantId: input.targetTenantId, roleIds };
        });
    }
}

export type { DisassociateRolesFromTenantInput };

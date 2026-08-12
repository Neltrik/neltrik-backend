import { Injectable } from "@nestjs/common";

import { TenantApi } from "@/core/tenant/api";
import { TransactionManager } from "@/shared/transaction";

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
            await this.tenantApi.validate(input.tenantId);
            await this.roleTenantRepository.disassociateRoles(roleIds, input.tenantId, context);
            return { tenantId: input.tenantId, roleIds };
        });
    }
}

export type { DisassociateRolesFromTenantInput };

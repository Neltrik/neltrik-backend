import { Injectable } from "@nestjs/common";

import { TenantApi } from "@/core/tenant/api";

import { CompanyNotFoundError } from "../../../../domain/errors";
import { MembershipRepository } from "../../../../domain/interfaces";
import { ValidateCompanyAccessInput } from "./input";

@Injectable()
export class ValidateCompanyAccessInternalUseCase {
    constructor(
        private readonly tenantApi: TenantApi,
        private readonly membershipRepository: MembershipRepository,
    ) {}

    public async execute(input: ValidateCompanyAccessInput): Promise<void> {
        const isPlatformAdmin = await this.tenantApi.isPlatformTenant(input.actorTenantId);
        if (isPlatformAdmin) {
            return;
        }
        const membership = await this.membershipRepository.findActiveByUserAndCompany(
            input.actorUserId,
            input.companyId,
        );
        if (!membership) {
            throw new CompanyNotFoundError();
        }
    }
}

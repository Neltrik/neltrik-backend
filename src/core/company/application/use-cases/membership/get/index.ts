import { Injectable } from "@nestjs/common";

import { TenantApi } from "@/core/tenant/api";
import { ForbiddenError } from "@/shared/errors";

import { MembershipNotFoundError } from "../../../../domain/errors";
import { MembershipRepository } from "../../../../domain/interfaces";
import { GetMembershipInput } from "./input";
import { GetMembershipOutput } from "./output";

@Injectable()
export class GetMembershipUseCase {
    constructor(
        private readonly tenantApi: TenantApi,
        private readonly membershipRepository: MembershipRepository,
    ) {}

    public async execute(input: GetMembershipInput): Promise<GetMembershipOutput> {
        const membership = await this.membershipRepository.findById(input.membershipId);
        if (!membership) {
            throw new MembershipNotFoundError();
        }
        const isPlatformAdmin = await this.tenantApi.isPlatformTenant(input.actorTenantId);
        if (!isPlatformAdmin) {
            const isOwner = membership.userId === input.actorUserId;
            if (!isOwner) {
                const actorMembership = await this.membershipRepository.findActiveByUserAndCompany(
                    input.actorUserId,
                    membership.companyId,
                );
                if (!actorMembership) {
                    throw new ForbiddenError();
                }
            }
        }
        return { membership };
    }
}

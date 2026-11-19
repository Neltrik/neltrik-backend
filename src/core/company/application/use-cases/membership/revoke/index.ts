import { Injectable } from "@nestjs/common";

import { TenantApi } from "@/core/tenant/api";
import { ForbiddenError } from "@/shared/errors";

import { MembershipNotFoundError } from "../../../../domain/errors";
import { MembershipRepository } from "../../../../domain/interfaces";
import { RevokeMemberInput } from "./input";
import { RevokeMemberOutput } from "./output";

@Injectable()
export class RevokeMemberUseCase {
    constructor(
        private readonly tenantApi: TenantApi,
        private readonly membershipRepository: MembershipRepository,
    ) {}

    public async execute(input: RevokeMemberInput): Promise<RevokeMemberOutput> {
        const membership = await this.membershipRepository.findById(input.membershipId);
        if (!membership) {
            throw new MembershipNotFoundError();
        }
        const isPlatformAdmin = await this.tenantApi.isPlatformTenant(input.actorTenantId);
        if (!isPlatformAdmin) {
            const actorMembership = await this.membershipRepository.findActiveByUserAndCompany(
                input.actorUserId,
                membership.companyId,
            );
            if (!actorMembership) {
                throw new ForbiddenError();
            }
        }
        if (membership.userId === input.actorUserId) {
            throw new ForbiddenError();
        }
        membership.revoke();
        await this.membershipRepository.update(membership);
        return { id: membership.id };
    }
}

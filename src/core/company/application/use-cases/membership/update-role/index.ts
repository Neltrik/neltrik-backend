import { Injectable } from "@nestjs/common";

import { AuthorizationRoleApi } from "@/core/authorization/api";
import { TenantApi } from "@/core/tenant/api";
import { ForbiddenError } from "@/shared/errors";

import { MembershipNotFoundError } from "../../../../domain/errors";
import { MembershipRepository } from "../../../../domain/interfaces";
import { UpdateMemberRoleInput } from "./input";
import { UpdateMemberRoleOutput } from "./output";

@Injectable()
export class UpdateMemberRoleUseCase {
    constructor(
        private readonly authorizationRoleApi: AuthorizationRoleApi,
        private readonly tenantApi: TenantApi,
        private readonly membershipRepository: MembershipRepository,
    ) {}

    public async execute(input: UpdateMemberRoleInput): Promise<UpdateMemberRoleOutput> {
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
        await this.authorizationRoleApi.validateForTenant({
            roleId: input.roleId,
            tenantId: membership.tenantId,
        });
        membership.changeRole(input.roleId);
        await this.membershipRepository.update(membership);
        return { id: membership.id };
    }
}

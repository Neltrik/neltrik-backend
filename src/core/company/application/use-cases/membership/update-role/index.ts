import { Injectable } from "@nestjs/common";

import { AuthorizationRoleApi } from "@/core/authorization/api";
import { ForbiddenError } from "@/shared/errors";

import { MembershipNotFoundError } from "../../../../domain/errors";
import { MembershipRepository } from "../../../../domain/interfaces";
import { UpdateMemberRoleInput } from "./input";
import { UpdateMemberRoleOutput } from "./output";

@Injectable()
export class UpdateMemberRoleUseCase {
    constructor(
        private readonly authorizationRoleApi: AuthorizationRoleApi,
        private readonly membershipRepository: MembershipRepository,
    ) {}

    public async execute(input: UpdateMemberRoleInput): Promise<UpdateMemberRoleOutput> {
        const membership = await this.membershipRepository.findById(input.membershipId);
        if (!membership) {
            throw new MembershipNotFoundError();
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

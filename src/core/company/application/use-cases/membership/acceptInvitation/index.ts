import { Injectable } from "@nestjs/common";

import { ForbiddenError } from "@/shared/errors";

import { MembershipExpiredError, MembershipNotFoundError } from "../../../../domain/errors";
import { MembershipRepository } from "../../../../domain/interfaces";
import { AcceptInvitationInput } from "./input";
import { AcceptInvitationOutput } from "./output";

@Injectable()
export class AcceptInvitationUseCase {
    constructor(private readonly membershipRepository: MembershipRepository) {}

    public async execute(input: AcceptInvitationInput): Promise<AcceptInvitationOutput> {
        const membership = await this.membershipRepository.findById(input.membershipId);
        if (!membership) {
            throw new MembershipNotFoundError();
        }
        if (membership.userId !== input.actorUserId) {
            throw new ForbiddenError();
        }
        if (membership.isExpired()) {
            throw new MembershipExpiredError();
        }
        membership.accept();
        await this.membershipRepository.update(membership);
        return { id: membership.id };
    }
}

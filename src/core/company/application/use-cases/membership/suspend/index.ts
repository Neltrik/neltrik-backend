import { Injectable } from "@nestjs/common";

import { ForbiddenError } from "@/shared/errors";

import { MembershipNotFoundError } from "../../../../domain/errors";
import { MembershipRepository } from "../../../../domain/interfaces";
import { SuspendMemberInput } from "./input";
import { SuspendMemberOutput } from "./output";

@Injectable()
export class SuspendMemberUseCase {
    constructor(private readonly membershipRepository: MembershipRepository) {}

    public async execute(input: SuspendMemberInput): Promise<SuspendMemberOutput> {
        const membership = await this.membershipRepository.findById(input.membershipId);
        if (!membership) {
            throw new MembershipNotFoundError();
        }
        if (membership.userId === input.actorUserId) {
            throw new ForbiddenError();
        }
        membership.suspend();
        await this.membershipRepository.update(membership);
        return { id: membership.id };
    }
}

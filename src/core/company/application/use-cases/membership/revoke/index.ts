import { Injectable } from "@nestjs/common";

import { ForbiddenError } from "@/shared/errors";

import { MembershipNotFoundError } from "../../../../domain/errors";
import { MembershipRepository } from "../../../../domain/interfaces";
import { RevokeMemberInput } from "./input";
import { RevokeMemberOutput } from "./output";

@Injectable()
export class RevokeMemberUseCase {
    constructor(private readonly membershipRepository: MembershipRepository) {}

    public async execute(input: RevokeMemberInput): Promise<RevokeMemberOutput> {
        const membership = await this.membershipRepository.findById(input.membershipId);
        if (!membership) {
            throw new MembershipNotFoundError();
        }
        if (membership.userId === input.actorUserId) {
            throw new ForbiddenError();
        }
        membership.revoke();
        await this.membershipRepository.update(membership);
        return { id: membership.id };
    }
}

import { Injectable } from "@nestjs/common";

import { MembershipNotFoundError } from "../../../../domain/errors";
import { MembershipRepository } from "../../../../domain/interfaces";
import { ReactivateMemberInput } from "./input";
import { ReactivateMemberOutput } from "./output";

@Injectable()
export class ReactivateMemberUseCase {
    constructor(private readonly membershipRepository: MembershipRepository) {}

    public async execute(input: ReactivateMemberInput): Promise<ReactivateMemberOutput> {
        const membership = await this.membershipRepository.findById(input.membershipId);
        if (!membership) {
            throw new MembershipNotFoundError();
        }
        membership.reactivate();
        await this.membershipRepository.update(membership);
        return { id: membership.id };
    }
}

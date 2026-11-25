import { Injectable } from "@nestjs/common";

import { MembershipNotFoundError } from "../../../../domain/errors";
import { MembershipRepository } from "../../../../domain/interfaces";
import { GetMembershipInput } from "./input";
import { GetMembershipOutput } from "./output";

@Injectable()
export class GetMembershipUseCase {
    constructor(private readonly membershipRepository: MembershipRepository) {}

    public async execute(input: GetMembershipInput): Promise<GetMembershipOutput> {
        const membership = await this.membershipRepository.findById(input.membershipId);
        if (!membership) {
            throw new MembershipNotFoundError();
        }
        return { membership };
    }
}

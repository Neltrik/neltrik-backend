import { Injectable } from "@nestjs/common";

import { paginate } from "@/shared/pagination";

import { MembershipRepository } from "../../../../domain/interfaces";
import { ListMyMembershipsInput } from "./input";
import { ListMyMembershipsOutput } from "./output";

@Injectable()
export class ListMyMembershipsUseCase {
    constructor(private readonly membershipRepository: MembershipRepository) {}

    public async execute(input: ListMyMembershipsInput): Promise<ListMyMembershipsOutput> {
        const memberships = await this.membershipRepository.findByUser({
            userId: input.actorUserId,
            status: input.status,
            cursor: input.cursor,
            limit: input.limit,
        });
        const { items, meta } = paginate({
            items: memberships,
            limit: input.limit,
            getId: (membership) => membership.id,
        });
        return { memberships: items, meta };
    }
}

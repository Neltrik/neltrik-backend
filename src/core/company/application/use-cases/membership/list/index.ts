import { Injectable } from "@nestjs/common";

import { paginate } from "@/shared/pagination";

import { CompanyNotFoundError } from "../../../../domain/errors";
import { CompanyRepository, MembershipRepository } from "../../../../domain/interfaces";
import type { ListMembersInput } from "./input";
import type { ListMembersOutput } from "./output";

@Injectable()
export class ListMembersUseCase {
    constructor(
        private readonly companyRepository: CompanyRepository,
        private readonly membershipRepository: MembershipRepository,
    ) {}

    public async execute(input: ListMembersInput): Promise<ListMembersOutput> {
        const company = await this.companyRepository.findById(input.companyId);
        if (!company) {
            throw new CompanyNotFoundError();
        }
        const memberships = await this.membershipRepository.findByCompany({
            companyId: input.companyId,
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

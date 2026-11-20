import { Injectable } from "@nestjs/common";

import { MembershipChecker } from "@/shared/authorization";

import { MembershipRepository } from "../../../domain/interfaces";

@Injectable()
export class MembershipCheckerProvider extends MembershipChecker {
    constructor(private readonly membershipRepository: MembershipRepository) {
        super();
    }

    public async hasActiveMembership(userId: string, companyId: string): Promise<boolean> {
        const membership = await this.membershipRepository.findActiveByUserAndCompany(userId, companyId);
        return membership !== null;
    }
}

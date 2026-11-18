import { Injectable } from "@nestjs/common";

import { IdGenerator } from "@/shared/id-generator";
import { OutboxRepository } from "@/shared/outbox";
import { TransactionManager } from "@/shared/transaction";

import { Membership } from "../../../../domain/entities";
import { CompanyNotFoundError, MembershipAlreadyExistsError } from "../../../../domain/errors";
import { CompanyRepository, MembershipRepository } from "../../../../domain/interfaces";
import { InviteMemberInput } from "./input";
import { InviteMemberOutput } from "./output";

@Injectable()
export class InviteMemberUseCase {
    constructor(
        private readonly idGenerator: IdGenerator,
        private readonly outboxRepository: OutboxRepository,
        private readonly transactionManager: TransactionManager,
        private readonly companyRepository: CompanyRepository,
        private readonly membershipRepository: MembershipRepository,
    ) {}

    public async execute(input: InviteMemberInput): Promise<InviteMemberOutput> {
        const company = await this.companyRepository.findById(input.companyId);
        if (!company) {
            throw new CompanyNotFoundError();
        }
        const existing = await this.membershipRepository.findByUserAndCompany(input.userId, input.companyId);
        if (existing && (existing.isPending() || existing.isActive())) {
            throw new MembershipAlreadyExistsError();
        }
        const now = new Date();
        const membership = Membership.create({
            id: this.idGenerator.generate(),
            tenantId: company.tenantId,
            userId: input.userId,
            companyId: input.companyId,
            roleId: input.roleId,
            createdAt: now,
        });
        await this.transactionManager.execute(async (context) => {
            await this.membershipRepository.create(membership, context);
            await this.outboxRepository.create(
                {
                    eventType: "SEND_INVITATION_EMAIL",
                    payload: {
                        membershipId: membership.id,
                        companyId: input.companyId,
                        userId: input.userId,
                        tenantId: company.tenantId,
                    },
                },
                context,
            );
        });
        return { id: membership.id };
    }
}

import { Injectable } from "@nestjs/common";

import { AuthorizationRoleApi } from "@/core/authorization/api";
import { UserApi } from "@/core/identity/api";
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
        private readonly authorizationRoleApi: AuthorizationRoleApi,
        private readonly userApi: UserApi,
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
        await this.userApi.validateUserById(input.userId);
        await this.authorizationRoleApi.validateForTenant({ roleId: input.roleId, tenantId: input.tenantId });
        const existing = await this.membershipRepository.findByUserAndCompany(input.userId, input.companyId);
        if (existing) {
            if (existing.isActive()) {
                throw new MembershipAlreadyExistsError();
            }
            if (existing.isPending()) {
                if (!existing.isExpired()) {
                    throw new MembershipAlreadyExistsError();
                }
                existing.revoke();
                await this.membershipRepository.update(existing);
            }
        }
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const membership = Membership.create({
            id: this.idGenerator.generate(),
            tenantId: company.tenantId,
            userId: input.userId,
            companyId: input.companyId,
            roleId: input.roleId,
            createdAt: now,
            expiresAt,
        });
        await this.transactionManager.execute(async (context) => {
            await this.membershipRepository.create(membership, context);
            await this.outboxRepository.create(
                {
                    eventType: "SEND_INVITATION_EMAIL",
                    payload: {
                        inviterUserId: input.actorUserId,
                        userId: input.userId,
                        companyName: company.name,
                        tenantId: company.tenantId,
                        membershipId: membership.id,
                    },
                },
                context,
            );
        });
        return { id: membership.id };
    }
}

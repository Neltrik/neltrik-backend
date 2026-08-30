import { Injectable } from "@nestjs/common";

import { AuthorizationRoleApi } from "@/core/authorization/api";
import { UnauthorizedError } from "@/shared/errors";
import { IdGenerator } from "@/shared/id-generator";

import { Invitation } from "../../../../domain/entities";
import { InvitationAlreadyExistsError, TenantNotFoundError } from "../../../../domain/errors";
import { InvitationRepository, TenantRepository } from "../../../../domain/interfaces";
import { ExpirationDate, Recipient, Token } from "../../../../domain/value-objects";
import { InvitationDeliveryStrategyFactory } from "../../../../infrastructure/strategies";
import { type CreateInvitationInput } from "./input";
import { CreateInvitationOutput } from "./output";

@Injectable()
export class CreateInvitationUseCase {
    constructor(
        private readonly invitationRepository: InvitationRepository,
        private readonly tenantRepository: TenantRepository,
        private readonly authorizationRoleApi: AuthorizationRoleApi,
        private readonly strategyFactory: InvitationDeliveryStrategyFactory,
        private readonly idGenerator: IdGenerator,
    ) {}

    public async execute(input: CreateInvitationInput): Promise<CreateInvitationOutput> {
        if (!input.tenantId) {
            throw new UnauthorizedError();
        }
        const tenant = await this.tenantRepository.get(input.tenantId);
        if (!tenant) {
            throw new TenantNotFoundError();
        }
        await this.authorizationRoleApi.validateForTenant({ roleId: input.roleId, tenantId: input.tenantId });
        const strategy = this.strategyFactory.create(input.mechanism);
        const existingInvitation = await this.invitationRepository.findPendingByTenantAndRecipient(
            input.tenantId,
            input.recipient,
        );
        if (existingInvitation) {
            throw new InvitationAlreadyExistsError();
        }
        const recipient = Recipient.create(input.recipient);
        const id = this.idGenerator.generate();
        const token = Token.create(this.idGenerator.generate());
        const expirationDate = ExpirationDate.create(this.calculateExpirationDate());
        const now = new Date();
        const invitation = Invitation.create({
            id,
            tenantId: input.tenantId,
            roleId: input.roleId,
            recipient,
            token,
            expirationDate,
            mechanism: input.mechanism,
            usedAt: null,
            revokedAt: null,
            createdAt: now,
            updatedAt: now,
        });
        await this.invitationRepository.create(invitation);
        const result = await strategy.deliver(token.value, input.recipient);
        return {
            invitationId: invitation.id,
            magicLink: result.magicLink,
        };
    }

    private calculateExpirationDate(): Date {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        return date;
    }
}

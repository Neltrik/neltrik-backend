import { Injectable } from "@nestjs/common";

import {
    InvitationAlreadyRevokedError,
    InvitationAlreadyUsedError,
    InvitationExpiredError,
    InvitationNotFoundError,
} from "../../../../domain/errors";
import { InvitationRepository } from "../../../../domain/interfaces";
import type { ValidateInvitationOhsOutput } from "./output";

@Injectable()
export class ValidateInvitationOhsUseCase {
    constructor(private readonly invitationRepository: InvitationRepository) {}

    public async execute(token: string): Promise<ValidateInvitationOhsOutput> {
        const invitation = await this.invitationRepository.getByToken(token);
        if (!invitation) {
            throw new InvitationNotFoundError();
        }
        if (invitation.isRevoked()) {
            throw new InvitationAlreadyRevokedError();
        }
        if (invitation.isExpired()) {
            throw new InvitationExpiredError();
        }
        if (!invitation.isPending()) {
            throw new InvitationAlreadyUsedError();
        }
        return {
            invitationId: invitation.id,
            tenantId: invitation.tenantId,
            roleId: invitation.roleId,
            recipient: invitation.recipient.value,
        };
    }
}

import { Injectable } from "@nestjs/common";

import {
    InvitationAlreadyRevokedError,
    InvitationAlreadyUsedError,
    InvitationExpiredError,
    InvitationNotFoundError,
} from "../../../../domain/errors";
import { InvitationRepository } from "../../../../domain/interfaces";
import { RevokeInvitationOutput } from "./output";

@Injectable()
export class RevokeInvitationUseCase {
    constructor(private readonly invitationRepository: InvitationRepository) {}

    public async execute(token: string): Promise<RevokeInvitationOutput> {
        const invitation = await this.invitationRepository.getByToken(token);
        if (!invitation) {
            throw new InvitationNotFoundError();
        }
        if (invitation.isUsed()) {
            throw new InvitationAlreadyUsedError();
        }
        if (invitation.isRevoked()) {
            throw new InvitationAlreadyRevokedError();
        }
        if (invitation.isExpired()) {
            throw new InvitationExpiredError();
        }
        invitation.revoke();
        await this.invitationRepository.update(invitation);
        return {
            invitationId: invitation.id,
            status: invitation.status,
            revokedAt: invitation.revokedAt,
        };
    }
}

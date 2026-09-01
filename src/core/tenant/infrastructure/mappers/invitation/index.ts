import type { Invitation as PrismaInvitation } from "@prisma/client";

import { Invitation } from "../../../domain/entities";
import { ExpirationDate, Recipient, Token } from "../../../domain/value-objects";

export class InvitationMapper {
    public static toPersistence(invitation: Invitation) {
        return {
            id: invitation.id,
            tenantId: invitation.tenantId,
            roleId: invitation.roleId,
            recipient: invitation.recipient.value,
            mechanism: invitation.mechanism,
            token: invitation.token.value,
            expiresAt: invitation.expirationDate.value,
            status: invitation.status,
            usedAt: invitation.usedAt,
            revokedAt: invitation.revokedAt,
            createdAt: invitation.createdAt,
            updatedAt: invitation.updatedAt,
        };
    }

    public static toDomain(prismaInvitation: PrismaInvitation): Invitation {
        return Invitation.restore({
            id: prismaInvitation.id,
            tenantId: prismaInvitation.tenantId,
            roleId: prismaInvitation.roleId,
            recipient: Recipient.create(prismaInvitation.recipient),
            token: Token.create(prismaInvitation.token),
            expirationDate: ExpirationDate.restore(prismaInvitation.expiresAt),
            mechanism: prismaInvitation.mechanism,
            status: prismaInvitation.status,
            usedAt: prismaInvitation.usedAt,
            revokedAt: prismaInvitation.revokedAt,
            createdAt: prismaInvitation.createdAt,
            updatedAt: prismaInvitation.updatedAt,
        });
    }
}

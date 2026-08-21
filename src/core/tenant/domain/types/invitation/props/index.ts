import type { ExpirationDate, Recipient, Token } from "../../../value-objects";
import type { InvitationStatus } from "..";

interface InvitationProps {
    id: string;
    tenantId: string;
    roleId: string;
    recipient: Recipient;
    token: Token;
    expirationDate: ExpirationDate;
    mechanism: string;
    usedAt: Date | null;
    revokedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export type InvitationState = InvitationProps & {
    status: InvitationStatus;
};

import type { ExpirationDate, Recipient, Token } from "../../../value-objects";
import type { InvitationStatus } from "..";

export type InvitationProps = {
    id: string;
    tenantId: string;
    roleId: string;
    recipient: Recipient;
    token: Token;
    expirationDate: ExpirationDate;
    status: InvitationStatus;
    usedAt: Date | null;
    revokedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

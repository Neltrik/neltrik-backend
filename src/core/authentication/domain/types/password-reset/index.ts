import type { ExpirationDate, TokenHash } from "../../value-objects";

export type PasswordResetProps = {
    id: string;
    authenticationAccountId: string;
    tokenHash: TokenHash;
    expiresAt: ExpirationDate;
    usedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

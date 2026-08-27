import type { ExpirationDate } from "../../value-objects";

export type AuthenticationSessionProps = {
    id: string;
    authenticationAccountId: string;
    refreshTokenHash: string;
    expiresAt: ExpirationDate;
    refreshTokenExpiresAt: ExpirationDate;
    revokedAt: Date | null;
    lastUsedAt: Date | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
    updatedAt: Date;
};

import type { ExpirationDate } from "../../value-objects";
import type { TokenHash } from "../../value-objects";

export type EmailVerificationProps = {
    id: string;
    authenticationAccountId: string;
    email: string;
    tokenHash: TokenHash;
    expiresAt: ExpirationDate;
    verifiedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

import type { EmailVerification } from "../../entities";

export abstract class EmailVerificationRepository {
    abstract create(verification: EmailVerification): Promise<void>;
    abstract update(verification: EmailVerification): Promise<void>;
    abstract findById(id: string): Promise<EmailVerification | null>;
    abstract findByTokenHash(tokenHash: string): Promise<EmailVerification | null>;
    abstract findPendingByAccount(authenticationAccountId: string): Promise<EmailVerification[]>;
    abstract invalidatePendingByAccount(authenticationAccountId: string): Promise<void>;
}

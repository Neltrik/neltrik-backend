import type { TransactionContext } from "@/shared/transaction";

import type { EmailVerification } from "../../entities";

export abstract class EmailVerificationRepository {
    abstract create(verification: EmailVerification, context?: TransactionContext): Promise<void>;
    abstract update(verification: EmailVerification, context?: TransactionContext): Promise<void>;
    abstract findById(id: string): Promise<EmailVerification | null>;
    abstract findByTokenHash(tokenHash: string): Promise<EmailVerification | null>;
    abstract findPendingByAccount(authenticationAccountId: string): Promise<EmailVerification[]>;
    abstract invalidatePendingByAccount(authenticationAccountId: string, context: TransactionContext): Promise<void>;
}

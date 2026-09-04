import type { TransactionContext } from "@/shared/transaction";

import type { PasswordReset } from "../../entities";

export abstract class PasswordResetRepository {
    abstract create(reset: PasswordReset, context?: TransactionContext): Promise<void>;
    abstract update(reset: PasswordReset, context?: TransactionContext): Promise<void>;
    abstract findByTokenHash(tokenHash: string): Promise<PasswordReset | null>;
}

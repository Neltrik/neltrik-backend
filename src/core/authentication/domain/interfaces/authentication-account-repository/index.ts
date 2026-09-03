import { type TransactionContext } from "@/shared/transaction";

import type { AuthenticationAccount } from "../../entities";

export abstract class AuthenticationAccountRepository {
    abstract create(account: AuthenticationAccount): Promise<void>;
    abstract findByUserId(userId: string): Promise<AuthenticationAccount | null>;
    abstract findByEmail(email: string): Promise<AuthenticationAccount | null>;
    abstract update(account: AuthenticationAccount, context?: TransactionContext): Promise<void>;
    abstract delete(id: string): Promise<void>;
    abstract findById(id: string): Promise<AuthenticationAccount | null>;
}

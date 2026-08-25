import type { AuthenticationAccount } from "../../entities";

export abstract class AuthenticationAccountRepository {
    abstract create(account: AuthenticationAccount): Promise<void>;
    abstract findByUserId(userId: string): Promise<AuthenticationAccount | null>;
    abstract findByEmail(email: string): Promise<AuthenticationAccount | null>;
    abstract update(account: AuthenticationAccount): Promise<void>;
}

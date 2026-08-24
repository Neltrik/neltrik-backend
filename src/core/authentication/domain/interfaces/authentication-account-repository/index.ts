import type { AuthenticationAccount } from "../../entities";

export abstract class AuthenticationAccountRepository {
    abstract create(account: AuthenticationAccount): Promise<void>;
    abstract getByUserId(userId: string): Promise<AuthenticationAccount | null>;
    abstract getByEmail(email: string): Promise<AuthenticationAccount | null>;
    abstract update(account: AuthenticationAccount): Promise<void>;
}

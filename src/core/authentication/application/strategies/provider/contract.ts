import { type AuthenticationAccount } from "../../../domain/entities";

export interface UserProfile {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
}

export abstract class ProviderAuthenticationStrategy {
    public abstract authenticate(account: AuthenticationAccount, credentials: unknown): Promise<UserProfile | null>;
    public abstract register(credentials: unknown): Promise<{
        passwordHash: string | null;
    }>;
}

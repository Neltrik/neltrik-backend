import type { AuthenticationProvider, PasswordHash } from "../../value-objects";

export type AuthenticationAccountProps = {
    id: string;
    userId: string;
    provider: AuthenticationProvider;
    email: string;
    emailVerified: boolean;
    passwordHash: PasswordHash;
    createdAt: Date;
    updatedAt: Date;
};

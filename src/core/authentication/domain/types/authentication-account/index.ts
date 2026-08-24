import type { PasswordHash } from "../../value-objects";

export type AuthenticationAccountProps = {
    id: string;
    userId: string;
    provider: string;
    email: string;
    emailVerified: boolean;
    passwordHash: PasswordHash | null;
    createdAt: Date;
    updatedAt: Date;
};

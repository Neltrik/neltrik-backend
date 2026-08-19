import type { Password } from "../../../../../domain/value-objects";

export type CreateAuthenticationAccountInput = {
    userId: string;
    provider: string;
    email: string;
    password: Password;
};

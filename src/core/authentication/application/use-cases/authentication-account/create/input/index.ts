import type { Password } from "../../../../../domain/value-objects";

export type CreateAuthenticationAccountInput = {
    firstName: string;
    lastName: string;
    email: string;
    tenantId: string;
    roleId: string;
    provider: string;
    password: Password;
};

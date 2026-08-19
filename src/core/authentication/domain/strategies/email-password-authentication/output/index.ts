import type { Password } from "../../../value-objects";
import type { PasswordHash } from "../../../value-objects";

export type EmailPasswordCredentials = {
    password: Password;
    passwordHash: PasswordHash;
};

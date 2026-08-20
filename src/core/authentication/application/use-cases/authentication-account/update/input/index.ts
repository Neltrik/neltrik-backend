import type { Password } from "../../../../../domain/value-objects";

export interface ChangeAuthenticationAccountPasswordInput {
    userId: string;
    password: Password;
}

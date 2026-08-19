import type { AuthenticationInput, AuthenticationResult } from "../../types";

export abstract class AuthenticationStrategy<TCredentials = unknown> {
    abstract authenticate(input: AuthenticationInput<TCredentials>): Promise<AuthenticationResult>;
}

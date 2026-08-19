import type { PasswordHasher } from "../../interfaces";
import type { AuthenticationInput, AuthenticationResult } from "../../types";
import { AuthenticationStrategy } from "../contract";
import type { EmailPasswordCredentials } from "./output";

export class EmailPasswordAuthenticationStrategy extends AuthenticationStrategy<EmailPasswordCredentials> {
    constructor(private readonly passwordHasher: PasswordHasher) {
        super();
    }

    public async authenticate(input: AuthenticationInput<EmailPasswordCredentials>): Promise<AuthenticationResult> {
        const authenticated = await this.passwordHasher.compare(
            input.credentials.password,
            input.credentials.passwordHash,
        );
        return { authenticated };
    }
}

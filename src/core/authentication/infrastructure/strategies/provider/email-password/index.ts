import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";

import { isEmailPasswordCredentials } from "../../../../application/strategies";
import { ProviderAuthenticationStrategy, UserProfile } from "../../../../application/strategies";
import { AuthenticationAccount } from "../../../../domain/entities";
import { InvalidCredentialsError } from "../../../../domain/errors";

@Injectable()
export class EmailPasswordProviderStrategy extends ProviderAuthenticationStrategy {
    private readonly saltRounds = 10;

    public async authenticate(account: AuthenticationAccount, credentials: unknown): Promise<UserProfile | null> {
        if (!isEmailPasswordCredentials(credentials)) {
            return null;
        }
        const { password } = credentials;
        if (!account.passwordHash) {
            return null;
        }
        const isValid = await bcrypt.compare(password, account.passwordHash.value);
        if (!isValid) {
            return null;
        }
        return { id: account.userId, email: account.email };
    }

    public async register(
        userId: string,
        email: string,
        credentials: unknown,
    ): Promise<{
        passwordHash: string | null;
        emailVerified: boolean;
        profile: UserProfile;
    }> {
        if (!isEmailPasswordCredentials(credentials)) {
            throw new InvalidCredentialsError();
        }
        const { password } = credentials;
        const passwordHash = await bcrypt.hash(password, this.saltRounds);
        return { passwordHash, emailVerified: false, profile: { id: userId, email } };
    }
}

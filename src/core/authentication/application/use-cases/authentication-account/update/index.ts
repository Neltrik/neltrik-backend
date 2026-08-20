import { Injectable } from "@nestjs/common";

import { AuthenticationAccountNotFoundError } from "../../../../domain/errors";
import { AuthenticationAccountRepository, PasswordHasher } from "../../../../domain/interfaces";
import { ChangeAuthenticationAccountPasswordInput } from "./input";

@Injectable()
export class ChangeAuthenticationAccountPasswordUseCase {
    constructor(
        private readonly authenticationAccountRepository: AuthenticationAccountRepository,
        private readonly passwordHasher: PasswordHasher,
    ) {}

    public async execute(input: ChangeAuthenticationAccountPasswordInput): Promise<void> {
        const account = await this.authenticationAccountRepository.findByUserId(input.userId);
        if (!account) {
            throw new AuthenticationAccountNotFoundError();
        }
        const passwordHash = await this.passwordHasher.hash(input.password);
        account.update({ passwordHash });
        await this.authenticationAccountRepository.update(account);
    }
}

export type { ChangeAuthenticationAccountPasswordInput };

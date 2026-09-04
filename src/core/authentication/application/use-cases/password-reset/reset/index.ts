import { Injectable } from "@nestjs/common";

import { TransactionManager } from "@/shared/transaction";

import { AuthenticationAccountNotFoundError, PasswordResetNotFoundError } from "../../../../domain/errors";
import {
    AuthenticationAccountRepository,
    AuthenticationSessionRepository,
    PasswordResetRepository,
} from "../../../../domain/interfaces";
import { PasswordHash, TokenHash } from "../../../../domain/value-objects";
import { PasswordHasher } from "../../../../infrastructure/providers";
import { ResetPasswordInput } from "./input";

@Injectable()
export class ResetPasswordUseCase {
    constructor(
        private readonly transactionManager: TransactionManager,
        private readonly accountRepository: AuthenticationAccountRepository,
        private readonly sessionRepository: AuthenticationSessionRepository,
        private readonly passwordResetRepository: PasswordResetRepository,
        private readonly passwordHasher: PasswordHasher,
    ) {}

    public async execute(input: ResetPasswordInput): Promise<void> {
        const tokenHash = TokenHash.hash(input.token);
        const reset = await this.passwordResetRepository.findByTokenHash(tokenHash);
        if (!reset) {
            throw new PasswordResetNotFoundError();
        }
        const account = await this.accountRepository.findById(reset.authenticationAccountId);
        if (!account) {
            throw new AuthenticationAccountNotFoundError();
        }
        await this.transactionManager.execute(async (context) => {
            reset.use(input.token);
            await this.passwordResetRepository.update(reset, context);
            const hashedPassword = await this.passwordHasher.hash(input.newPassword);
            const passwordHash = PasswordHash.create(hashedPassword);
            account.update({ passwordHash });
            await this.accountRepository.update(account, context);
            await this.sessionRepository.invalidateByAccount(account.id, context);
        });
    }
}

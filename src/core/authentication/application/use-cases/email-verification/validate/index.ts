import { Injectable } from "@nestjs/common";

import { TransactionManager } from "@/shared/transaction";

import {
    AuthenticationAccountNotFoundError,
    EmailVerificationNotFoundError,
    InvalidTokenError,
} from "../../../../domain/errors";
import { AuthenticationAccountRepository, EmailVerificationRepository } from "../../../../domain/interfaces";
import { TokenHash } from "../../../../domain/value-objects";

@Injectable()
export class ValidateEmailVerificationUseCase {
    constructor(
        private readonly transactionManager: TransactionManager,
        private readonly accountRepository: AuthenticationAccountRepository,
        private readonly emailVerificationRepository: EmailVerificationRepository,
    ) {}

    public async execute(token: string): Promise<void> {
        if (!token || token.trim() === "") {
            throw new InvalidTokenError();
        }
        const tokenHash = TokenHash.hash(token);
        const verification = await this.emailVerificationRepository.findByTokenHash(tokenHash);
        if (!verification) {
            throw new EmailVerificationNotFoundError();
        }
        const account = await this.accountRepository.findById(verification.authenticationAccountId);
        if (!account) {
            throw new AuthenticationAccountNotFoundError();
        }
        await this.transactionManager.execute(async (context) => {
            verification.complete(token);
            await this.emailVerificationRepository.update(verification, context);
            account.verifyEmail();
            await this.accountRepository.update(account, context);
        });
    }
}

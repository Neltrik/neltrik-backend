import { Injectable } from "@nestjs/common";

import { IdGenerator } from "@/shared/id-generator";
import { TransactionManager } from "@/shared/transaction";

import { EmailVerification } from "../../../../domain/entities";
import { AuthenticationAccountNotFoundError, EmailAlreadyVerifiedError } from "../../../../domain/errors";
import { AuthenticationAccountRepository, EmailVerificationRepository } from "../../../../domain/interfaces";
import { ExpirationDate, TokenHash } from "../../../../domain/value-objects";
import { EmailSender } from "../../../../infrastructure/providers";

@Injectable()
export class RequestEmailVerificationUseCase {
    constructor(
        private readonly idGenerator: IdGenerator,
        private readonly transactionManager: TransactionManager,
        private readonly accountRepository: AuthenticationAccountRepository,
        private readonly emailVerificationRepository: EmailVerificationRepository,
        private readonly emailSender: EmailSender,
    ) {}

    public async execute(authenticationAccountId: string): Promise<void> {
        const account = await this.accountRepository.findById(authenticationAccountId);
        if (!account) {
            throw new AuthenticationAccountNotFoundError();
        }
        if (account.emailVerified) {
            throw new EmailAlreadyVerifiedError();
        }
        const { token, hash } = TokenHash.generate();
        const now = new Date();
        await this.transactionManager.execute(async (context) => {
            await this.emailVerificationRepository.invalidatePendingByAccount(authenticationAccountId, context);
            const verification = EmailVerification.create({
                id: this.idGenerator.generate(),
                authenticationAccountId,
                email: account.email,
                tokenHash: hash,
                expiresAt: ExpirationDate.create(new Date(Date.now() + 24 * 60 * 60 * 1000)),
                createdAt: now,
                updatedAt: now,
            });
            await this.emailVerificationRepository.create(verification, context);
        });
        await this.emailSender.sendVerificationEmail(account.email, token);
    }
}

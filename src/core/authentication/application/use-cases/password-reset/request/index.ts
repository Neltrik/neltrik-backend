import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";

import { TransactionManager } from "@/shared/transaction";

import { PasswordReset } from "../../../../domain/entities";
import { AuthenticationAccountRepository, PasswordResetRepository } from "../../../../domain/interfaces";
import { ExpirationDate, TokenHash } from "../../../../domain/value-objects";
import { EmailSender } from "../../../../infrastructure/providers";

@Injectable()
export class RequestPasswordResetUseCase {
    constructor(
        private readonly transactionManager: TransactionManager,
        private readonly accountRepository: AuthenticationAccountRepository,
        private readonly passwordResetRepository: PasswordResetRepository,
        private readonly emailSender: EmailSender,
    ) {}

    public async execute(email: string): Promise<void> {
        const account = await this.accountRepository.findByEmail(email);
        if (!account) {
            return;
        }
        const { token, hash } = TokenHash.generate();
        await this.transactionManager.execute(async (context) => {
            await this.passwordResetRepository.invalidatePendingByAccount(account.id, context);
            const reset = PasswordReset.create({
                id: randomUUID(),
                authenticationAccountId: account.id,
                tokenHash: hash,
                expiresAt: ExpirationDate.create(new Date(Date.now() + 24 * 60 * 60 * 1000)),
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            await this.passwordResetRepository.create(reset, context);
        });
        await this.emailSender.sendPasswordResetEmail(email, token);
    }
}

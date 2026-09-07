import { Injectable } from "@nestjs/common";

import { TransactionManager } from "@/shared/transaction";

import { AuthenticationAccountNotFoundError } from "../../../../domain/errors";
import { AuthenticationAccountRepository, AuthenticationSessionRepository } from "../../../../domain/interfaces";
import { RevokeAllSessionsInput } from "./input";

@Injectable()
export class RevokeAllSessionsUseCase {
    constructor(
        private readonly transactionManager: TransactionManager,
        private readonly accountRepository: AuthenticationAccountRepository,
        private readonly sessionRepository: AuthenticationSessionRepository,
    ) {}

    public async execute(input: RevokeAllSessionsInput): Promise<void> {
        const account = await this.accountRepository.findByUserId(input.userId);
        if (!account) {
            throw new AuthenticationAccountNotFoundError();
        }
        await this.transactionManager.execute(async (context) => {
            await this.sessionRepository.revokeAllExcept(account.id, input.currentSessionId, context);
        });
    }
}

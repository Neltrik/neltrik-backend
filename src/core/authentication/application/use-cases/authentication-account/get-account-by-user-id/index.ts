import { Injectable } from "@nestjs/common";

import { AuthenticationAccount } from "../../../../domain/entities";
import { AuthenticationAccountNotFoundError } from "../../../../domain/errors";
import { AuthenticationAccountRepository } from "../../../../domain/interfaces";

@Injectable()
export class GetAccountByUserIdUseCase {
    constructor(private readonly accountRepository: AuthenticationAccountRepository) {}

    public async execute(userId: string): Promise<AuthenticationAccount> {
        const account = await this.accountRepository.findByUserId(userId);
        if (!account) {
            throw new AuthenticationAccountNotFoundError();
        }
        return account;
    }
}

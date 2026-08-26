import { Injectable } from "@nestjs/common";

import { AuthenticationAccount } from "../../../../domain/entities";
import { AuthenticationAccountNotFoundError } from "../../../../domain/errors";
import { AuthenticationAccountRepository } from "../../../../domain/interfaces";

@Injectable()
export class GetAccountByEmailUseCase {
    constructor(private readonly accountRepository: AuthenticationAccountRepository) {}

    public async execute(email: string): Promise<AuthenticationAccount> {
        const account = await this.accountRepository.findByEmail(email);
        if (!account) {
            throw new AuthenticationAccountNotFoundError();
        }
        return account;
    }
}

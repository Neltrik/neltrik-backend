import { Injectable } from "@nestjs/common";

import { AuthenticationAccountNotFoundError } from "../../../../domain/errors";
import { AuthenticationAccountRepository } from "../../../../domain/interfaces";
import { GetAuthenticationAccountByEmailOutput } from "./output";

@Injectable()
export class GetAuthenticationAccountByEmailUseCase {
    constructor(private readonly authenticationAccountRepository: AuthenticationAccountRepository) {}

    public async execute(email: string): Promise<GetAuthenticationAccountByEmailOutput> {
        const account = await this.authenticationAccountRepository.findByEmail(email);
        if (!account) {
            throw new AuthenticationAccountNotFoundError();
        }
        return {
            id: account.id,
            userId: account.userId,
            provider: account.provider.value,
            email: account.email,
            emailVerified: account.emailVerified,
            createdAt: account.createdAt,
            updatedAt: account.updatedAt,
        };
    }
}

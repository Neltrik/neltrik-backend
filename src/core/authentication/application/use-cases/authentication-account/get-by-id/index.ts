import { Injectable } from "@nestjs/common";

import { AuthenticationAccountNotFoundError } from "../../../../domain/errors";
import { AuthenticationAccountRepository } from "../../../../domain/interfaces";
import { GetAuthenticationAccountByUserIdOutput } from "./output";

@Injectable()
export class GetAuthenticationAccountByUserIdUseCase {
    constructor(private readonly authenticationAccountRepository: AuthenticationAccountRepository) {}

    public async execute(userId: string): Promise<GetAuthenticationAccountByUserIdOutput> {
        const account = await this.authenticationAccountRepository.findByUserId(userId);
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

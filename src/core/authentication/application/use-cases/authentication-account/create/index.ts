import { Injectable } from "@nestjs/common";

import { UserApi } from "@/core/identity/api";
import { IdGenerator } from "@/shared/id-generator";

import { AuthenticationAccount } from "../../../../domain/entities";
import { AuthenticationAccountAlreadyExistsError } from "../../../../domain/errors";
import { AuthenticationAccountRepository, PasswordHasher } from "../../../../domain/interfaces";
import { AuthenticationProvider } from "../../../../domain/value-objects";
import { CreateAuthenticationAccountInput } from "./input";
import { CreateAuthenticationAccountOutput } from "./output";

@Injectable()
export class CreateAuthenticationAccountUseCase {
    constructor(
        private readonly userApi: UserApi,
        private readonly idGenerator: IdGenerator,
        private readonly authenticationAccountRepository: AuthenticationAccountRepository,
        private readonly passwordHasher: PasswordHasher,
    ) {}

    public async execute(input: CreateAuthenticationAccountInput): Promise<CreateAuthenticationAccountOutput> {
        await this.userApi.validateUserById(input.userId);
        await this.userApi.validateEmail(input.email);
        const existingAccount = await this.authenticationAccountRepository.findByUserId(input.userId);
        if (existingAccount) {
            throw new AuthenticationAccountAlreadyExistsError();
        }
        const passwordHash = await this.passwordHasher.hash(input.password);
        const now = new Date();
        const account = AuthenticationAccount.create({
            id: this.idGenerator.generate(),
            userId: input.userId,
            email: input.email,
            provider: AuthenticationProvider.create(input.provider),
            passwordHash,
            createdAt: now,
            updatedAt: now,
        });
        await this.authenticationAccountRepository.create(account);
        return { id: account.id };
    }
}

export type { CreateAuthenticationAccountInput };

import { Injectable } from "@nestjs/common";

import { UserApi } from "@/core/identity/api";
import { InvitationApi } from "@/core/tenant/api";
import { IdGenerator } from "@/shared/id-generator";
import { SagaOrchestrator, type SagaStep } from "@/shared/saga";

import { AuthenticationAccount } from "../../../../domain/entities";
import { EmailMismatchError } from "../../../../domain/errors";
import { AuthenticationAccountRepository } from "../../../../domain/interfaces";
import { PasswordHash } from "../../../../domain/value-objects";
import { ProviderAuthenticationStrategyFactory } from "../../../../infrastructure/strategies";
import { type RegisterInput } from "./input";
import { type RegisterOutput } from "./output";
import type { RegisterSagaContext, RegisterStepResult } from "./types";

@Injectable()
export class RegisterUseCase {
    constructor(
        private readonly userApi: UserApi,
        private readonly invitationApi: InvitationApi,
        private readonly idGenerator: IdGenerator,
        private readonly accountRepository: AuthenticationAccountRepository,
        private readonly strategyFactory: ProviderAuthenticationStrategyFactory,
    ) {}

    public async execute(input: RegisterInput): Promise<RegisterOutput> {
        const invitation = await this.invitationApi.validate(input.invitationToken);
        if (input.email !== invitation.recipient) {
            throw new EmailMismatchError();
        }
        const strategy = this.strategyFactory.create(input.provider);
        const now = new Date();
        const steps: SagaStep<RegisterStepResult>[] = [
            {
                execute: async (context: RegisterSagaContext) => {
                    const user = await this.userApi.create({
                        tenantId: invitation.tenantId,
                        roleId: invitation.roleId,
                        email: input.email,
                        firstName: input.firstName,
                        lastName: input.lastName,
                    });
                    context.userId = user.id;
                },
                compensate: async (context: RegisterSagaContext) => {
                    if (context.userId) {
                        await this.userApi.delete(context.userId);
                    }
                },
            },
            {
                execute: async (context: RegisterSagaContext) => {
                    const { passwordHash } = await strategy.register(input.credentials);
                    const account = AuthenticationAccount.create({
                        id: this.idGenerator.generate(),
                        userId: context.userId!,
                        provider: input.provider,
                        email: input.email,
                        passwordHash: passwordHash ? PasswordHash.create(passwordHash) : null,
                        createdAt: now,
                        updatedAt: now,
                    });
                    await this.accountRepository.create(account);
                    context.id = account.id;
                },
                compensate: async (context: RegisterSagaContext) => {
                    if (context.id) {
                        await this.accountRepository.delete(context.id);
                    }
                },
            },
            {
                execute: async () => {
                    await this.invitationApi.consume(input.invitationToken);
                },
            },
        ];
        const context = await SagaOrchestrator.execute<RegisterSagaContext>(steps, {});
        return { accountId: context.id! };
    }
}

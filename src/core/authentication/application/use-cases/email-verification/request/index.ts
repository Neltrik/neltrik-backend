import { Injectable } from "@nestjs/common";

import { env } from "@/config/index";
import { UserApi } from "@/core/identity/api";
import { LOCALES, NOTIFICATION_CHANNEL, NOTIFICATION_CODES, NotificationApi } from "@/core/notifications/api";
import { TenantApi } from "@/core/tenant/api";
import { IdGenerator } from "@/shared/id-generator";
import { TransactionManager } from "@/shared/transaction";

import { EmailVerification } from "../../../../domain/entities";
import { AuthenticationAccountNotFoundError, EmailAlreadyVerifiedError } from "../../../../domain/errors";
import { AuthenticationAccountRepository, EmailVerificationRepository } from "../../../../domain/interfaces";
import { ExpirationDate, TokenHash } from "../../../../domain/value-objects";
import type { RequestEmailVerificationInput } from "./input";

@Injectable()
export class RequestEmailVerificationUseCase {
    constructor(
        private readonly userApi: UserApi,
        private readonly notificationApi: NotificationApi,
        private readonly tenantApi: TenantApi,
        private readonly idGenerator: IdGenerator,
        private readonly transactionManager: TransactionManager,
        private readonly accountRepository: AuthenticationAccountRepository,
        private readonly emailVerificationRepository: EmailVerificationRepository,
    ) {}

    public async execute(input: RequestEmailVerificationInput): Promise<void> {
        const account = await this.accountRepository.findByUserId(input.userId);
        if (!account) {
            throw new AuthenticationAccountNotFoundError();
        }
        if (account.emailVerified) {
            throw new EmailAlreadyVerifiedError();
        }
        const { token, hash } = TokenHash.generate();
        const now = new Date();
        await this.transactionManager.execute(async (context) => {
            await this.emailVerificationRepository.invalidatePendingByAccount(account.id, context);
            const verification = EmailVerification.create({
                id: this.idGenerator.generate(),
                authenticationAccountId: account.id,
                email: account.email,
                tokenHash: hash,
                expiresAt: ExpirationDate.create(new Date(Date.now() + 24 * 60 * 60 * 1000)),
                createdAt: now,
                updatedAt: now,
            });
            await this.emailVerificationRepository.create(verification, context);
        });
        const user = await this.userApi.getUserById(account.userId);
        const tenant = await this.tenantApi.getById(user.tenantId);
        await this.notificationApi.send({
            tenantId: input.tenantId,
            recipientId: account.userId,
            recipientEmail: account.email,
            code: NOTIFICATION_CODES.EMAIL_VERIFICATION,
            channels: [NOTIFICATION_CHANNEL.EMAIL],
            payload: {
                name: user.firstName,
                email: account.email,
                verificationUrl: `${env.FRONTEND_URL}/auth/verify-email?token=${token}`,
                tenantName: tenant.name,
            },
            locale: LOCALES.ES_CO,
        });
    }
}

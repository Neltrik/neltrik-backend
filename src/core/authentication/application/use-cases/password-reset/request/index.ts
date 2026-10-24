import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";

import { env } from "@/config/index";
import { UserApi } from "@/core/identity/api";
import { LOCALES, NOTIFICATION_CHANNEL, NOTIFICATION_CODES, NotificationApi } from "@/core/notifications/api";
import { TenantApi } from "@/core/tenant/api";
import { TransactionManager } from "@/shared/transaction";

import { PasswordReset } from "../../../../domain/entities";
import { AuthenticationAccountRepository, PasswordResetRepository } from "../../../../domain/interfaces";
import { ExpirationDate, TokenHash } from "../../../../domain/value-objects";

@Injectable()
export class RequestPasswordResetUseCase {
    constructor(
        private readonly userApi: UserApi,
        private readonly notificationApi: NotificationApi,
        private readonly tenantApi: TenantApi,
        private readonly transactionManager: TransactionManager,
        private readonly accountRepository: AuthenticationAccountRepository,
        private readonly passwordResetRepository: PasswordResetRepository,
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
        const user = await this.userApi.getUserById(account.userId);
        const tenant = await this.tenantApi.getById(user.tenantId);
        await this.notificationApi.send({
            tenantId: user.tenantId,
            recipientId: account.userId,
            recipientEmail: account.email,
            code: NOTIFICATION_CODES.RESET_PASSWORD,
            channels: [NOTIFICATION_CHANNEL.EMAIL],
            payload: {
                name: user.firstName,
                email: account.email,
                resetUrl: `${env.FRONTEND_URL}/auth/reset-password?token=${token}`,
                tenantName: tenant.name,
            },
            locale: LOCALES.ES_CO,
        });
    }
}

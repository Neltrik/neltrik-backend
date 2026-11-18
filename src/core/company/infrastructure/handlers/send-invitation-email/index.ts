import { Injectable } from "@nestjs/common";

import { env } from "@/config/index";
import { UserApi } from "@/core/identity/api";
import { LOCALES, NOTIFICATION_CHANNEL, NOTIFICATION_CODES, NotificationApi } from "@/core/notifications/api";
import { TenantApi } from "@/core/tenant/api";
import { type OutboxEventRecord, OutboxHandler } from "@/shared/outbox";

@Injectable()
export class SendInvitationEmailOutboxHandler extends OutboxHandler {
    public readonly eventType = "SEND_INVITATION_EMAIL";

    constructor(
        private readonly userApi: UserApi,
        private readonly notificationApi: NotificationApi,
        private readonly tenantApi: TenantApi,
    ) {
        super();
    }

    public async handle(event: OutboxEventRecord): Promise<void> {
        const { membershipId, userId, companyName, tenantId, inviterUserId } = event.payload as {
            membershipId: string;
            userId: string;
            companyName: string;
            tenantId: string;
            inviterUserId: string;
        };
        const [inviterUser, user, tenant] = await Promise.all([
            this.userApi.getUserById(inviterUserId),
            this.userApi.getUserById(userId),
            this.tenantApi.getById(tenantId),
        ]);
        await this.notificationApi.send({
            tenantId,
            recipientId: userId,
            recipientEmail: user.email,
            code: NOTIFICATION_CODES.COMPANY_INVITATION,
            channels: [NOTIFICATION_CHANNEL.EMAIL],
            locale: LOCALES.ES_CO,
            payload: {
                inviterName: `${inviterUser.firstName} ${inviterUser.lastName}`,
                companyName,
                tenantName: tenant.name,
                invitationUrl: `${env.FRONTEND_URL}/memberships/${membershipId}/accept`,
            },
        });
    }
}

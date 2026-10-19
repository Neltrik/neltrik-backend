import { Module } from "@nestjs/common";

import { TenantModule } from "@/core/tenant/tenant.module";

import { GetNotificationTemplateUseCase, ListNotificationTemplatesUseCase } from "./application/use-cases";
import { ResolveNotificationTemplateInternalUseCase } from "./application/use-cases-internal";
import { NotificationRepository, NotificationTemplateRepository } from "./domain/interfaces";
import { PrismaNotificationRepository, PrismaNotificationTemplateRepository } from "./infrastructure/repositories";

@Module({
    providers: [
        GetNotificationTemplateUseCase,
        ListNotificationTemplatesUseCase,
        ResolveNotificationTemplateInternalUseCase,
        {
            provide: NotificationRepository,
            useClass: PrismaNotificationRepository,
        },
        {
            provide: NotificationTemplateRepository,
            useClass: PrismaNotificationTemplateRepository,
        },
    ],
    imports: [TenantModule],
})
export class NotificationsModule {}

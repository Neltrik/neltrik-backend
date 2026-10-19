import { Module } from "@nestjs/common";

import { ResolveNotificationTemplateInternalUseCase } from "./application/use-cases-internal";
import { NotificationRepository, NotificationTemplateRepository } from "./domain/interfaces";
import { PrismaNotificationRepository, PrismaNotificationTemplateRepository } from "./infrastructure/repositories";

@Module({
    providers: [
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
})
export class NotificationsModule {}

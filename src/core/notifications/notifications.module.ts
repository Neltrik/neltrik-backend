import { Module } from "@nestjs/common";

import { TenantModule } from "@/core/tenant/tenant.module";

import {
    ActivateNotificationTemplateUseCase,
    CreateNotificationTemplateUseCase,
    DesactivateNotificationTemplateUseCase,
    GetNotificationTemplateUseCase,
    ListNotificationTemplatesUseCase,
    UpdateNotificationTemplateUseCase,
} from "./application/use-cases";
import { ResolveNotificationTemplateInternalUseCase } from "./application/use-cases-internal";
import { NotificationRepository, NotificationTemplateRepository } from "./domain/interfaces";
import { PrismaNotificationRepository, PrismaNotificationTemplateRepository } from "./infrastructure/repositories";
import { TemplateManagementController, TemplateStateController } from "./presentation/controllers";

@Module({
    controllers: [TemplateManagementController, TemplateStateController],
    providers: [
        ActivateNotificationTemplateUseCase,
        CreateNotificationTemplateUseCase,
        DesactivateNotificationTemplateUseCase,
        GetNotificationTemplateUseCase,
        ListNotificationTemplatesUseCase,
        UpdateNotificationTemplateUseCase,
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

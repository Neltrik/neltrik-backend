import { HttpStatus, Module } from "@nestjs/common";

import { TenantModule } from "@/core/tenant/tenant.module";
import { DomainStatusRegistry } from "@/shared/http";

import {
    ActivateNotificationTemplateUseCase,
    CreateNotificationTemplateUseCase,
    DesactivateNotificationTemplateUseCase,
    GetNotificationTemplateUseCase,
    ListNotificationTemplatesUseCase,
    UpdateNotificationTemplateUseCase,
} from "./application/use-cases";
import { ResolveNotificationTemplateInternalUseCase } from "./application/use-cases-internal";
import { DOMAIN_ERROR_CODES } from "./domain/errors";
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
export class NotificationsModule {
    public onModuleInit(): void {
        DomainStatusRegistry.register(DOMAIN_ERROR_CODES.NOTIFICATION_TEMPLATE_ALREADY_EXISTS, HttpStatus.CONFLICT);
        DomainStatusRegistry.register(DOMAIN_ERROR_CODES.NOTIFICATION_TEMPLATE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
}

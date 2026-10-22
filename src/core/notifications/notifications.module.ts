import { HttpStatus, Module } from "@nestjs/common";

import { TenantModule } from "@/core/tenant/tenant.module";
import { DomainStatusRegistry } from "@/shared/http";

import { NotificationApi, NotificationApiImpl } from "./api";
import { SendNotificationJobsUseCase } from "./application/jobs/send-notification";
import {
    ActivateNotificationTemplateUseCase,
    CreateNotificationTemplateUseCase,
    DesactivateNotificationTemplateUseCase,
    GetNotificationTemplateUseCase,
    ListNotificationsUseCase,
    ListNotificationTemplatesUseCase,
    MarkAllNotificationsAsReadUseCase,
    MarkNotificationAsReadUseCase,
    UpdateNotificationTemplateUseCase,
} from "./application/use-cases";
import { ResolveNotificationTemplateInternalUseCase } from "./application/use-cases-internal";
import { SendNotificationOhsUseCase } from "./application/use-cases-ohs";
import { DOMAIN_ERROR_CODES } from "./domain/errors";
import { NotificationRepository, NotificationTemplateRepository, TemplateRenderer } from "./domain/interfaces";
import { StringInterpolationRenderer } from "./domain/renderers";
import { SendNotificationHandler } from "./infrastructure/jobs";
import { NodemailerEmailSender } from "./infrastructure/providers";
import { PrismaNotificationRepository, PrismaNotificationTemplateRepository } from "./infrastructure/repositories";
import { EmailSenderFactory } from "./infrastructure/strategies";
import {
    NotificationController,
    TemplateManagementController,
    TemplateStateController,
} from "./presentation/controllers";

@Module({
    controllers: [NotificationController, TemplateManagementController, TemplateStateController],
    providers: [
        SendNotificationJobsUseCase,
        ActivateNotificationTemplateUseCase,
        CreateNotificationTemplateUseCase,
        DesactivateNotificationTemplateUseCase,
        GetNotificationTemplateUseCase,
        ListNotificationsUseCase,
        ListNotificationTemplatesUseCase,
        MarkAllNotificationsAsReadUseCase,
        MarkNotificationAsReadUseCase,
        UpdateNotificationTemplateUseCase,
        ResolveNotificationTemplateInternalUseCase,
        SendNotificationOhsUseCase,
        NodemailerEmailSender,
        EmailSenderFactory,
        SendNotificationHandler,
        {
            provide: NotificationApi,
            useClass: NotificationApiImpl,
        },
        {
            provide: NotificationRepository,
            useClass: PrismaNotificationRepository,
        },
        {
            provide: NotificationTemplateRepository,
            useClass: PrismaNotificationTemplateRepository,
        },
        {
            provide: TemplateRenderer,
            useClass: StringInterpolationRenderer,
        },
    ],
    imports: [TenantModule],
    exports: [NotificationApi],
})
export class NotificationsModule {
    public onModuleInit(): void {
        DomainStatusRegistry.register(DOMAIN_ERROR_CODES.NOTIFICATION_TEMPLATE_ALREADY_EXISTS, HttpStatus.CONFLICT);
        DomainStatusRegistry.register(DOMAIN_ERROR_CODES.NOTIFICATION_TEMPLATE_NOT_FOUND, HttpStatus.NOT_FOUND);
        DomainStatusRegistry.register(DOMAIN_ERROR_CODES.NOTIFICATION_NOT_FOUND, HttpStatus.NOT_FOUND);
        DomainStatusRegistry.register(DOMAIN_ERROR_CODES.UNSUPPORTED_EMAIL_PROVIDER, HttpStatus.BAD_REQUEST);
    }
}

import { Injectable } from "@nestjs/common";

import { Notification } from "../../../domain/entities";
import { NotificationNotFoundError, TemplateVariableMissingError } from "../../../domain/errors";
import { NotificationRepository, TemplateRenderer } from "../../../domain/interfaces";
import { extractVariables } from "../../../domain/template";
import { NOTIFICATION_CHANNEL } from "../../../domain/types";
import { EmailSenderFactory } from "../../../infrastructure/strategies";
import { EMAIL_PROVIDER } from "../../../infrastructure/strategies/email-provider/types";
import { ResolveNotificationTemplateInternalUseCase } from "../../use-cases-internal";
import type { SendNotificationJobsInput } from "./input";
import type { SendNotificationJobsOutput } from "./output";

@Injectable()
export class SendNotificationJobsUseCase {
    constructor(
        private readonly notificationRepository: NotificationRepository,
        private readonly templateRenderer: TemplateRenderer,
        private readonly emailSenderFactory: EmailSenderFactory,
        private readonly resolveNotificationTemplateUseCase: ResolveNotificationTemplateInternalUseCase,
    ) {}

    public async execute(input: SendNotificationJobsInput): Promise<SendNotificationJobsOutput> {
        const notification = await this.notificationRepository.findById(input.notificationId);
        if (!notification) {
            throw new NotificationNotFoundError();
        }
        if (notification.isSent()) {
            return { notificationId: notification.id };
        }
        for (const channel of notification.channels) {
            notification.registerAttempt();
            if (channel === NOTIFICATION_CHANNEL.EMAIL) {
                await this.sendEmail(notification);
            }
        }
        notification.markAsSent();
        await this.notificationRepository.update(notification);
        return { notificationId: notification.id };
    }

    private async sendEmail(notification: Notification): Promise<void> {
        try {
            const template = await this.resolveNotificationTemplateUseCase.execute({
                code: notification.code,
                channel: NOTIFICATION_CHANNEL.EMAIL,
                locale: notification.locale,
                tenantId: notification.tenantId,
            });
            if (!template.subject) {
                throw new Error(`Template ${template.code} has no subject for EMAIL channel`);
            }
            const variables = extractVariables(template.body);
            const missing = variables.filter((variable) => !(variable in notification.payload));
            if (missing.length > 0) {
                throw new TemplateVariableMissingError(missing);
            }
            const renderedSubject = this.templateRenderer.render(template.subject, notification.payload);
            const renderedBody = this.templateRenderer.render(template.body, notification.payload);
            const emailSender = this.emailSenderFactory.create(EMAIL_PROVIDER.NODEMAILER);
            await emailSender.send({
                to: notification.recipientEmail!,
                subject: renderedSubject,
                body: renderedBody,
                html: renderedBody,
            });
        } catch (error) {
            notification.markAsFailed(error instanceof Error ? error.message : "Unknown error");
            await this.notificationRepository.update(notification);
            throw error;
        }
    }
}

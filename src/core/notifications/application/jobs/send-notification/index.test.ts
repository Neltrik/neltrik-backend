import type { Notification } from "../../../domain/entities";
import { NotificationNotFoundError } from "../../../domain/errors";
import type { NotificationRepository, TemplateRenderer } from "../../../domain/interfaces";
import { NOTIFICATION_CHANNEL } from "../../../domain/types";
import type { EmailSenderFactory } from "../../../infrastructure/strategies";
import { EMAIL_PROVIDER } from "../../../infrastructure/strategies/email-provider/types";
import type { ResolveNotificationTemplateInternalUseCase } from "../../use-cases-internal";
import { SendNotificationJobsUseCase } from "./index";

const makeSut = (channels: Notification["channels"] = [NOTIFICATION_CHANNEL.EMAIL]) => {
    const notificationRepository = {
        findById: jest.fn(),
        update: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<NotificationRepository>;
    const resolveNotificationTemplateUseCase = {
        execute: jest.fn().mockResolvedValue({ code: "WELCOME", subject: "Welcome {{name}}", body: "Hello {{name}}" }),
    } as unknown as jest.Mocked<ResolveNotificationTemplateInternalUseCase>;
    const templateRenderer = {
        render: jest.fn((template: string) => template.replace("{{name}}", "John")),
    } as unknown as jest.Mocked<TemplateRenderer>;
    const emailSender = { send: jest.fn().mockResolvedValue(undefined) };
    const emailSenderFactory = {
        create: jest.fn().mockReturnValue(emailSender),
    } as unknown as jest.Mocked<EmailSenderFactory>;
    const notification = {
        id: "notification-id",
        code: "WELCOME",
        locale: "en",
        tenantId: "tenant-id",
        recipientEmail: "user@example.com",
        payload: { name: "John" },
        channels,
        isSent: jest.fn().mockReturnValue(false),
        registerAttempt: jest.fn(),
        markAsSent: jest.fn(),
        markAsFailed: jest.fn(),
    } as unknown as jest.Mocked<Notification>;
    const input = { notificationId: notification.id };
    notificationRepository.findById.mockResolvedValue(notification);
    const useCase = new SendNotificationJobsUseCase(
        notificationRepository,
        resolveNotificationTemplateUseCase,
        templateRenderer,
        emailSenderFactory,
    );
    return {
        useCase,
        notificationRepository,
        resolveNotificationTemplateUseCase,
        templateRenderer,
        emailSenderFactory,
        emailSender,
        notification,
        input,
    };
};

describe("SendNotificationJobsUseCase", () => {
    it("should send notification successfully", async () => {
        const {
            useCase,
            notificationRepository,
            resolveNotificationTemplateUseCase,
            templateRenderer,
            emailSenderFactory,
            emailSender,
            notification,
            input,
        } = makeSut();
        await expect(useCase.execute(input)).resolves.toEqual({ notificationId: notification.id });
        expect(notificationRepository.findById).toHaveBeenCalledWith(input.notificationId);
        expect(notification.registerAttempt).toHaveBeenCalledTimes(1);
        expect(resolveNotificationTemplateUseCase.execute).toHaveBeenCalledWith({
            code: notification.code,
            channel: NOTIFICATION_CHANNEL.EMAIL,
            locale: notification.locale,
            tenantId: notification.tenantId,
        });
        expect(templateRenderer.render).toHaveBeenNthCalledWith(1, "Welcome {{name}}", notification.payload);
        expect(templateRenderer.render).toHaveBeenNthCalledWith(2, "Hello {{name}}", notification.payload);
        expect(emailSenderFactory.create).toHaveBeenCalledWith(EMAIL_PROVIDER.NODEMAILER);
        expect(emailSender.send).toHaveBeenCalledWith({
            to: notification.recipientEmail,
            subject: "Welcome John",
            body: "Hello John",
            html: "Hello John",
        });
        expect(notification.markAsSent).toHaveBeenCalledTimes(1);
        expect(notificationRepository.update).toHaveBeenCalledWith(notification);
    });

    it("should throw NotificationNotFoundError when notification does not exist", async () => {
        const { useCase, notificationRepository, emailSenderFactory, input } = makeSut();
        notificationRepository.findById.mockResolvedValue(null);
        await expect(useCase.execute(input)).rejects.toThrow(NotificationNotFoundError);
        expect(emailSenderFactory.create).not.toHaveBeenCalled();
        expect(notificationRepository.update).not.toHaveBeenCalled();
    });

    it("should not process a notification that has already been sent", async () => {
        const { useCase, notificationRepository, notification, emailSenderFactory, input } = makeSut();
        notification.isSent.mockReturnValue(true);
        await expect(useCase.execute(input)).resolves.toEqual({ notificationId: notification.id });
        expect(notification.registerAttempt).not.toHaveBeenCalled();
        expect(emailSenderFactory.create).not.toHaveBeenCalled();
        expect(notificationRepository.update).not.toHaveBeenCalled();
    });

    it("should register an attempt for each channel", async () => {
        const channels = [NOTIFICATION_CHANNEL.EMAIL, NOTIFICATION_CHANNEL.IN_APP];
        const { useCase, notification, input } = makeSut(channels);
        await useCase.execute(input);
        expect(notification.registerAttempt).toHaveBeenCalledTimes(channels.length);
    });

    it("should mark notification as sent after processing channels", async () => {
        const { useCase, notification, notificationRepository, input } = makeSut();
        await useCase.execute(input);
        expect(notification.markAsSent).toHaveBeenCalledTimes(1);
        expect(notificationRepository.update).toHaveBeenCalledWith(notification);
    });

    it("should not send email when notification has no channels", async () => {
        const {
            useCase,
            notification,
            resolveNotificationTemplateUseCase,
            emailSenderFactory,
            notificationRepository,
            input,
        } = makeSut([]);
        await expect(useCase.execute(input)).resolves.toEqual({ notificationId: notification.id });
        expect(notification.registerAttempt).not.toHaveBeenCalled();
        expect(resolveNotificationTemplateUseCase.execute).not.toHaveBeenCalled();
        expect(emailSenderFactory.create).not.toHaveBeenCalled();
        expect(notification.markAsSent).toHaveBeenCalledTimes(1);
        expect(notificationRepository.update).toHaveBeenCalledWith(notification);
    });

    it("should throw when email template has no subject", async () => {
        const {
            useCase,
            resolveNotificationTemplateUseCase,
            notification,
            notificationRepository,
            emailSenderFactory,
            input,
        } = makeSut();
        resolveNotificationTemplateUseCase.execute.mockResolvedValue({
            code: "WELCOME",
            subject: "",
            body: "Hello {{name}}",
        } as Awaited<ReturnType<typeof resolveNotificationTemplateUseCase.execute>>);
        await expect(useCase.execute(input)).rejects.toThrow("Template WELCOME has no subject for EMAIL channel");
        expect(notification.markAsFailed).toHaveBeenCalledWith("Template WELCOME has no subject for EMAIL channel");
        expect(notificationRepository.update).toHaveBeenCalledWith(notification);
        expect(emailSenderFactory.create).not.toHaveBeenCalled();
    });

    it("should mark notification as failed when template resolution fails", async () => {
        const { useCase, resolveNotificationTemplateUseCase, notification, notificationRepository, input } = makeSut();
        resolveNotificationTemplateUseCase.execute.mockRejectedValue(new Error("Template resolution failed"));
        await expect(useCase.execute(input)).rejects.toThrow("Template resolution failed");
        expect(notification.markAsFailed).toHaveBeenCalledWith("Template resolution failed");
        expect(notificationRepository.update).toHaveBeenCalledWith(notification);
        expect(notification.markAsSent).not.toHaveBeenCalled();
    });

    it("should mark notification as failed when email sending fails", async () => {
        const { useCase, emailSender, notification, notificationRepository, input } = makeSut();
        emailSender.send.mockRejectedValue(new Error("Email delivery failed"));
        await expect(useCase.execute(input)).rejects.toThrow("Email delivery failed");
        expect(notification.markAsFailed).toHaveBeenCalledWith("Email delivery failed");
        expect(notificationRepository.update).toHaveBeenCalledWith(notification);
        expect(notification.markAsSent).not.toHaveBeenCalled();
    });

    it("should use Unknown error when a non-Error value is thrown", async () => {
        const { useCase, resolveNotificationTemplateUseCase, notification, notificationRepository, input } = makeSut();
        resolveNotificationTemplateUseCase.execute.mockRejectedValue("unexpected error");
        await expect(useCase.execute(input)).rejects.toBe("unexpected error");
        expect(notification.markAsFailed).toHaveBeenCalledWith("Unknown error");
        expect(notificationRepository.update).toHaveBeenCalledWith(notification);
    });

    it("should propagate errors when finding notification fails", async () => {
        const { useCase, notificationRepository, emailSenderFactory, input } = makeSut();
        notificationRepository.findById.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(input)).rejects.toThrow("Database error");
        expect(emailSenderFactory.create).not.toHaveBeenCalled();
        expect(notificationRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate errors when updating notification fails", async () => {
        const { useCase, notificationRepository, input } = makeSut();
        notificationRepository.update.mockRejectedValue(new Error("Database update failed"));
        await expect(useCase.execute(input)).rejects.toThrow("Database update failed");
    });
});

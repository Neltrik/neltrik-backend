import type { IdGenerator } from "@/shared/id-generator";
import type { JobScheduler } from "@/shared/jobs";

import type { NotificationRepository } from "../../../../domain/interfaces";
import { NOTIFICATION_CHANNEL, SEND_NOTIFICATION_JOB, SEND_NOTIFICATION_QUEUE } from "../../../../domain/types";
import { TenantApiSpy } from "../../../../test-doubles";
import type { ResolveNotificationTemplateInternalUseCase } from "../../../use-cases-internal";
import { SendNotificationOhsUseCase } from "./index";
import type { SendNotificationOhsInput } from "./input";

const makeInput = (): SendNotificationOhsInput => ({
    tenantId: "tenant-id",
    recipientId: "recipient-id",
    recipientEmail: "john@company.com",
    code: "WELCOME",
    channels: [NOTIFICATION_CHANNEL.EMAIL],
    payload: { name: "John" },
    locale: "en",
});

describe("SendNotificationOhsUseCase", () => {
    const makeSut = () => {
        const tenantApi = new TenantApiSpy();
        tenantApi.validate.mockResolvedValue(undefined);
        const generateMock = jest.fn().mockReturnValue("notification-id");
        const idGenerator = { generate: generateMock } satisfies IdGenerator;
        const enqueueMock = jest.fn().mockResolvedValue(undefined);
        const jobScheduler = { enqueue: enqueueMock } as unknown as JobScheduler;
        const createMock = jest.fn().mockResolvedValue(undefined);
        const notificationRepository = { create: createMock } as unknown as NotificationRepository;
        const resolveTemplateMock = jest.fn().mockResolvedValue({ code: "WELCOME", subject: "Welcome", body: "Hello" });
        const resolveNotificationTemplateUseCase = {
            execute: resolveTemplateMock,
        } as unknown as ResolveNotificationTemplateInternalUseCase;
        const useCase = new SendNotificationOhsUseCase(
            tenantApi,
            idGenerator,
            jobScheduler,
            notificationRepository,
            resolveNotificationTemplateUseCase,
        );
        return { useCase, tenantApi, generateMock, enqueueMock, createMock, resolveTemplateMock };
    };

    it("should create a notification and enqueue the job successfully", async () => {
        const { useCase, tenantApi, generateMock, enqueueMock, createMock, resolveTemplateMock } = makeSut();
        const input = makeInput();
        const result = await useCase.execute(input);
        expect(result).toBe("notification-id");
        expect(tenantApi.validate).toHaveBeenCalledTimes(1);
        expect(tenantApi.validate).toHaveBeenCalledWith(input.tenantId);
        expect(generateMock).toHaveBeenCalledTimes(1);
        expect(resolveTemplateMock).toHaveBeenCalledTimes(1);
        expect(resolveTemplateMock).toHaveBeenCalledWith({
            code: input.code,
            channel: NOTIFICATION_CHANNEL.EMAIL,
            locale: input.locale,
            tenantId: input.tenantId,
        });
        expect(createMock).toHaveBeenCalledTimes(1);
        expect(createMock).toHaveBeenCalledWith(
            expect.objectContaining({
                id: "notification-id",
                tenantId: input.tenantId,
                recipientId: input.recipientId,
                recipientEmail: input.recipientEmail,
                code: input.code,
                channels: input.channels,
                payload: input.payload,
                locale: input.locale,
            }),
        );
        expect(enqueueMock).toHaveBeenCalledTimes(1);
        expect(enqueueMock).toHaveBeenCalledWith(
            SEND_NOTIFICATION_QUEUE,
            SEND_NOTIFICATION_JOB,
            { notificationId: "notification-id" },
            { attempts: 3, backoff: { type: "exponential", delayMs: 5000 }, removeOnComplete: 100, removeOnFail: 1000 },
        );
    });

    it("should validate tenant before resolving templates", async () => {
        const { useCase, tenantApi, resolveTemplateMock, createMock } = makeSut();
        const callOrder: string[] = [];
        tenantApi.validate.mockImplementation(() => {
            callOrder.push("validate");
            return Promise.resolve();
        });
        resolveTemplateMock.mockImplementation(() => {
            callOrder.push("resolve-template");
            return Promise.resolve({ code: "WELCOME", subject: "Welcome", body: "Hello" });
        });
        await useCase.execute(makeInput());
        expect(tenantApi.validate).toHaveBeenCalledTimes(1);
        expect(resolveTemplateMock).toHaveBeenCalledTimes(1);
        expect(createMock).toHaveBeenCalledTimes(1);
        expect(callOrder).toEqual(["validate", "resolve-template"]);
    });

    it("should resolve a template for each notification channel", async () => {
        const { useCase, resolveTemplateMock } = makeSut();
        const input: SendNotificationOhsInput = {
            ...makeInput(),
            channels: [NOTIFICATION_CHANNEL.EMAIL, NOTIFICATION_CHANNEL.IN_APP],
        };
        await useCase.execute(input);
        expect(resolveTemplateMock).toHaveBeenCalledTimes(2);
        expect(resolveTemplateMock).toHaveBeenNthCalledWith(1, {
            code: input.code,
            channel: NOTIFICATION_CHANNEL.EMAIL,
            locale: input.locale,
            tenantId: input.tenantId,
        });
        expect(resolveTemplateMock).toHaveBeenNthCalledWith(2, {
            code: input.code,
            channel: NOTIFICATION_CHANNEL.IN_APP,
            locale: input.locale,
            tenantId: input.tenantId,
        });
    });

    it("should propagate errors when tenant validation fails", async () => {
        const { useCase, tenantApi, resolveTemplateMock, generateMock, createMock, enqueueMock } = makeSut();
        tenantApi.validate.mockRejectedValue(new Error("Tenant validation failed"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Tenant validation failed");
        expect(resolveTemplateMock).not.toHaveBeenCalled();
        expect(generateMock).not.toHaveBeenCalled();
        expect(createMock).not.toHaveBeenCalled();
        expect(enqueueMock).not.toHaveBeenCalled();
    });

    it("should propagate errors when resolving a notification template fails", async () => {
        const { useCase, resolveTemplateMock, createMock, enqueueMock } = makeSut();
        resolveTemplateMock.mockRejectedValue(new Error("Template not found"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Template not found");
        expect(createMock).not.toHaveBeenCalled();
        expect(enqueueMock).not.toHaveBeenCalled();
    });

    it("should propagate repository errors when creating a notification", async () => {
        const { useCase, createMock, enqueueMock } = makeSut();
        createMock.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(createMock).toHaveBeenCalledTimes(1);
        expect(enqueueMock).not.toHaveBeenCalled();
    });

    it("should propagate scheduler errors when enqueueing the notification job", async () => {
        const { useCase, createMock, enqueueMock } = makeSut();
        enqueueMock.mockRejectedValue(new Error("Queue error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Queue error");
        expect(createMock).toHaveBeenCalledTimes(1);
        expect(enqueueMock).toHaveBeenCalledTimes(1);
    });

    it("should enqueue the job only after creating the notification", async () => {
        const { useCase, createMock, enqueueMock } = makeSut();
        const callOrder: string[] = [];
        createMock.mockImplementation(() => {
            callOrder.push("create");
            return Promise.resolve(undefined);
        });
        enqueueMock.mockImplementation(() => {
            callOrder.push("enqueue");
            return Promise.resolve(undefined);
        });
        await useCase.execute(makeInput());
        expect(createMock).toHaveBeenCalledTimes(1);
        expect(enqueueMock).toHaveBeenCalledTimes(1);
        expect(callOrder).toEqual(["create", "enqueue"]);
    });
});

import type { IdGenerator } from "@/shared/id-generator";
import type { JobScheduler } from "@/shared/jobs";

import { NOTIFICATION_CODE_CATEGORIES } from "../../../../domain/catalogs";
import type { NotificationRepository } from "../../../../domain/interfaces";
import {
    NOTIFICATION_CATEGORY,
    NOTIFICATION_CHANNEL,
    SEND_NOTIFICATION_JOB,
    SEND_NOTIFICATION_QUEUE,
} from "../../../../domain/types";
import { TenantApiSpy } from "../../../../test-doubles";
import type {
    ResolveNotificationPreferenceInternalUseCase,
    ResolveNotificationTemplateInternalUseCase,
} from "../../../use-cases-internal";
import { SendNotificationOhsUseCase } from "./index";
import type { SendNotificationOhsInput } from "./input";

jest.mock("sanitize-html", () => jest.fn((html: string) => html));

const makeInput = (overrides: Partial<SendNotificationOhsInput> = {}): SendNotificationOhsInput => ({
    tenantId: "tenant-id",
    recipientId: "recipient-id",
    recipientEmail: "john@company.com",
    code: "EMAIL_VERIFICATION",
    channels: [NOTIFICATION_CHANNEL.EMAIL],
    payload: { name: "John" },
    locale: "en",
    ...overrides,
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
        const resolveTemplateMock = jest
            .fn()
            .mockResolvedValue({ code: "EMAIL_VERIFICATION", subject: "Welcome", body: "Hello" });
        const resolveNotificationTemplateUseCase = {
            execute: resolveTemplateMock,
        } as unknown as ResolveNotificationTemplateInternalUseCase;
        const resolvePreferenceMock = jest.fn().mockResolvedValue(true);
        const resolveNotificationPreferenceUseCase = {
            execute: resolvePreferenceMock,
        } as unknown as ResolveNotificationPreferenceInternalUseCase;
        const useCase = new SendNotificationOhsUseCase(
            tenantApi,
            idGenerator,
            jobScheduler,
            notificationRepository,
            resolveNotificationTemplateUseCase,
            resolveNotificationPreferenceUseCase,
        );
        return {
            useCase,
            tenantApi,
            generateMock,
            enqueueMock,
            createMock,
            resolveTemplateMock,
            resolvePreferenceMock,
        };
    };

    it("should create a notification and enqueue the job", async () => {
        const { useCase, tenantApi, generateMock, enqueueMock, createMock, resolveTemplateMock } = makeSut();
        const input = makeInput();
        await expect(useCase.execute(input)).resolves.toBe("notification-id");
        expect(tenantApi.validate).toHaveBeenCalledWith(input.tenantId);
        expect(generateMock).toHaveBeenCalledTimes(1);
        expect(resolveTemplateMock).toHaveBeenCalledWith({
            code: input.code,
            channel: NOTIFICATION_CHANNEL.EMAIL,
            locale: input.locale,
            tenantId: input.tenantId,
        });
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
        expect(enqueueMock).toHaveBeenCalledWith(
            SEND_NOTIFICATION_QUEUE,
            SEND_NOTIFICATION_JOB,
            { notificationId: "notification-id" },
            { attempts: 3, backoff: { type: "exponential", delayMs: 5000 }, removeOnComplete: 100, removeOnFail: 1000 },
        );
    });

    it("should validate tenant before resolving templates", async () => {
        const { useCase, tenantApi, resolveTemplateMock } = makeSut();
        const order: string[] = [];
        tenantApi.validate.mockImplementation(() => {
            order.push("validate");
            return Promise.resolve();
        });
        resolveTemplateMock.mockImplementation(() => {
            order.push("template");
            return Promise.resolve({ code: "EMAIL_VERIFICATION", subject: "Welcome", body: "Hello" });
        });
        await useCase.execute(makeInput());
        expect(order).toEqual(["validate", "template"]);
    });

    it("should resolve a template for each channel", async () => {
        const { useCase, resolveTemplateMock } = makeSut();
        const input = makeInput({
            channels: [NOTIFICATION_CHANNEL.EMAIL, NOTIFICATION_CHANNEL.IN_APP],
        });
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

    it("should return null when no channels are allowed", async () => {
        const { useCase, resolvePreferenceMock, resolveTemplateMock, generateMock, createMock, enqueueMock } =
            makeSut();
        resolvePreferenceMock.mockResolvedValue(false);
        await expect(useCase.execute(makeInput({ code: "WELCOME" }))).resolves.toBeNull();
        expect(resolvePreferenceMock).toHaveBeenCalledTimes(1);
        expect(resolveTemplateMock).not.toHaveBeenCalled();
        expect(generateMock).not.toHaveBeenCalled();
        expect(createMock).not.toHaveBeenCalled();
        expect(enqueueMock).not.toHaveBeenCalled();
    });

    it("should include only channels with accepted preferences", async () => {
        const { useCase, resolvePreferenceMock, resolveTemplateMock, createMock } = makeSut();
        resolvePreferenceMock.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
        await useCase.execute(
            makeInput({ code: "WELCOME", channels: [NOTIFICATION_CHANNEL.EMAIL, NOTIFICATION_CHANNEL.IN_APP] }),
        );
        expect(resolvePreferenceMock).toHaveBeenCalledTimes(2);
        expect(resolveTemplateMock).toHaveBeenCalledTimes(1);
        expect(createMock).toHaveBeenCalledWith(expect.objectContaining({ channels: [NOTIFICATION_CHANNEL.EMAIL] }));
    });

    it("should skip preferences for transactional notifications", async () => {
        const { useCase, resolvePreferenceMock } = makeSut();
        const code = (
            Object.keys(NOTIFICATION_CODE_CATEGORIES) as Array<keyof typeof NOTIFICATION_CODE_CATEGORIES>
        ).find((key) => NOTIFICATION_CODE_CATEGORIES[key] === NOTIFICATION_CATEGORY.TRANSACTIONAL);
        if (!code) {
            throw new Error("Missing transactional notification code in catalog");
        }
        await useCase.execute(makeInput({ code }));
        expect(resolvePreferenceMock).not.toHaveBeenCalled();
    });

    it("should propagate tenant validation errors", async () => {
        const { useCase, tenantApi, resolveTemplateMock, generateMock, createMock, enqueueMock } = makeSut();
        tenantApi.validate.mockRejectedValue(new Error("Tenant validation failed"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Tenant validation failed");
        expect(resolveTemplateMock).not.toHaveBeenCalled();
        expect(generateMock).not.toHaveBeenCalled();
        expect(createMock).not.toHaveBeenCalled();
        expect(enqueueMock).not.toHaveBeenCalled();
    });

    it("should propagate preference resolution errors", async () => {
        const { useCase, resolvePreferenceMock, resolveTemplateMock, createMock, enqueueMock } = makeSut();
        resolvePreferenceMock.mockRejectedValue(new Error("Preference resolution failed"));
        await expect(useCase.execute(makeInput({ code: "WELCOME" }))).rejects.toThrow("Preference resolution failed");
        expect(resolveTemplateMock).not.toHaveBeenCalled();
        expect(createMock).not.toHaveBeenCalled();
        expect(enqueueMock).not.toHaveBeenCalled();
    });

    it("should propagate template resolution errors", async () => {
        const { useCase, resolveTemplateMock, createMock, enqueueMock } = makeSut();
        resolveTemplateMock.mockRejectedValue(new Error("Template not found"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Template not found");
        expect(createMock).not.toHaveBeenCalled();
        expect(enqueueMock).not.toHaveBeenCalled();
    });

    it("should propagate repository errors", async () => {
        const { useCase, createMock, enqueueMock } = makeSut();
        createMock.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(createMock).toHaveBeenCalledTimes(1);
        expect(enqueueMock).not.toHaveBeenCalled();
    });

    it("should propagate scheduler errors", async () => {
        const { useCase, createMock, enqueueMock } = makeSut();
        enqueueMock.mockRejectedValue(new Error("Queue error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Queue error");
        expect(createMock).toHaveBeenCalledTimes(1);
        expect(enqueueMock).toHaveBeenCalledTimes(1);
    });

    it("should create the notification before enqueueing the job", async () => {
        const { useCase, createMock, enqueueMock } = makeSut();
        const order: string[] = [];
        createMock.mockImplementation(() => {
            order.push("create");
            return Promise.resolve(undefined);
        });
        enqueueMock.mockImplementation(() => {
            order.push("enqueue");
            return Promise.resolve(undefined);
        });
        await useCase.execute(makeInput());
        expect(order).toEqual(["create", "enqueue"]);
    });
});

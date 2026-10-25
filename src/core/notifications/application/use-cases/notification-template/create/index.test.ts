import { ForbiddenError } from "@/shared/errors";
import type { IdGenerator } from "@/shared/id-generator";

import { NotificationTemplate } from "../../../../domain/entities";
import { NotificationTemplateAlreadyExistsError } from "../../../../domain/errors";
import { NotificationTemplateRepositorySpy, TenantApiSpy } from "../../../../test-doubles";
import { CreateNotificationTemplateUseCase } from "./index";
import type { CreateNotificationTemplateInput } from "./input";

jest.mock("sanitize-html", () => jest.fn((html: string) => html));

const makeInput = (): CreateNotificationTemplateInput => ({
    actorTenantId: "tenant-id",
    targetTenantId: "tenant-id",
    code: "EMAIL_VERIFICATION",
    channel: "EMAIL",
    locale: "en",
    subject: "Welcome",
    body: "Welcome to our platform.",
});

describe("CreateNotificationTemplateUseCase", () => {
    const makeCandidate = (overrides: Partial<Parameters<typeof NotificationTemplate.create>[0]> = {}) =>
        NotificationTemplate.create({
            id: "existing-template-id",
            tenantId: "tenant-id",
            code: "EMAIL_VERIFICATION",
            channel: "EMAIL",
            locale: "en",
            subject: "Welcome",
            body: "Welcome to our platform.",
            createdAt: new Date(),
            ...overrides,
        });

    const makeSut = () => {
        const tenantApi = new TenantApiSpy();
        tenantApi.isPlatformTenant.mockResolvedValue(false);

        const generateMock = jest.fn().mockReturnValue("template-id");
        const idGenerator = {
            generate: generateMock,
        } satisfies IdGenerator;

        const notificationTemplateRepository = new NotificationTemplateRepositorySpy();
        notificationTemplateRepository.findActiveByCombinationCandidates.mockResolvedValue([]);
        notificationTemplateRepository.create.mockResolvedValue(undefined);

        const useCase = new CreateNotificationTemplateUseCase(tenantApi, idGenerator, notificationTemplateRepository);

        return {
            useCase,
            tenantApi,
            generateMock,
            notificationTemplateRepository,
        };
    };

    it("should create a notification template successfully", async () => {
        const { useCase, tenantApi, generateMock, notificationTemplateRepository } = makeSut();
        const input = makeInput();

        const result = await useCase.execute(input);

        expect(tenantApi.isPlatformTenant).toHaveBeenCalledWith(input.actorTenantId);
        expect(generateMock).toHaveBeenCalledTimes(1);

        expect(notificationTemplateRepository.findActiveByCombinationCandidates).toHaveBeenCalledWith(
            input.code,
            input.channel,
            input.locale,
            input.targetTenantId,
        );

        expect(notificationTemplateRepository.create).toHaveBeenCalledTimes(1);
        expect(notificationTemplateRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                id: "template-id",
                tenantId: input.targetTenantId,
                code: input.code,
                channel: input.channel,
                locale: input.locale,
                subject: input.subject,
                body: input.body,
            }),
        );

        expect(result).toBe("template-id");
    });

    it("should allow a platform actor to create a template for another tenant", async () => {
        const { useCase, tenantApi, notificationTemplateRepository } = makeSut();
        tenantApi.isPlatformTenant.mockResolvedValue(true);

        const input = {
            ...makeInput(),
            actorTenantId: "platform-tenant-id",
            targetTenantId: "another-tenant-id",
        };

        const result = await useCase.execute(input);

        expect(tenantApi.isPlatformTenant).toHaveBeenCalledWith(input.actorTenantId);
        expect(notificationTemplateRepository.findActiveByCombinationCandidates).toHaveBeenCalledWith(
            input.code,
            input.channel,
            input.locale,
            input.targetTenantId,
        );
        expect(notificationTemplateRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                tenantId: "another-tenant-id",
            }),
        );
        expect(result).toBe("template-id");
    });

    it("should allow a platform actor to create a platform template", async () => {
        const { useCase, tenantApi, notificationTemplateRepository } = makeSut();
        tenantApi.isPlatformTenant.mockResolvedValue(true);

        const input = {
            ...makeInput(),
            actorTenantId: "platform-tenant-id",
            targetTenantId: null,
        };

        const result = await useCase.execute(input);

        expect(tenantApi.isPlatformTenant).toHaveBeenCalledWith(input.actorTenantId);
        expect(notificationTemplateRepository.findActiveByCombinationCandidates).toHaveBeenCalledWith(
            input.code,
            input.channel,
            input.locale,
            null,
        );
        expect(notificationTemplateRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                tenantId: null,
            }),
        );
        expect(result).toBe("template-id");
    });

    it("should throw ForbiddenError when a non-platform actor targets another tenant", async () => {
        const { useCase, tenantApi, notificationTemplateRepository, generateMock } = makeSut();

        const input = {
            ...makeInput(),
            actorTenantId: "tenant-a",
            targetTenantId: "tenant-b",
        };

        await expect(useCase.execute(input)).rejects.toThrow(ForbiddenError);

        expect(tenantApi.isPlatformTenant).toHaveBeenCalledWith(input.actorTenantId);
        expect(generateMock).not.toHaveBeenCalled();
        expect(notificationTemplateRepository.findActiveByCombinationCandidates).not.toHaveBeenCalled();
        expect(notificationTemplateRepository.create).not.toHaveBeenCalled();
    });

    it("should throw NotificationTemplateAlreadyExistsError when a conflict exists", async () => {
        const { useCase, notificationTemplateRepository } = makeSut();
        const candidate = makeCandidate();

        notificationTemplateRepository.findActiveByCombinationCandidates.mockResolvedValue([candidate]);

        await expect(useCase.execute(makeInput())).rejects.toThrow(NotificationTemplateAlreadyExistsError);

        expect(notificationTemplateRepository.create).not.toHaveBeenCalled();
    });

    it("should not create a template when any candidate conflicts", async () => {
        const { useCase, notificationTemplateRepository } = makeSut();

        const candidateWithoutConflict = makeCandidate({
            id: "candidate-1",
            locale: "es",
            subject: "Bienvenido",
            body: "Bienvenido a nuestra plataforma.",
        });

        const conflictingCandidate = makeCandidate({
            id: "candidate-2",
        });

        notificationTemplateRepository.findActiveByCombinationCandidates.mockResolvedValue([
            candidateWithoutConflict,
            conflictingCandidate,
        ]);

        const templateHasConflictSpy = jest.spyOn(NotificationTemplate, "create");

        try {
            await expect(useCase.execute(makeInput())).rejects.toThrow(NotificationTemplateAlreadyExistsError);

            expect(notificationTemplateRepository.create).not.toHaveBeenCalled();
            expect(templateHasConflictSpy).toHaveBeenCalledTimes(1);
        } finally {
            templateHasConflictSpy.mockRestore();
        }
    });

    it("should create a template when candidates do not conflict", async () => {
        const { useCase, notificationTemplateRepository } = makeSut();

        notificationTemplateRepository.findActiveByCombinationCandidates.mockResolvedValue([
            makeCandidate({
                id: "existing-template-id",
                locale: "es",
                subject: "Bienvenido",
                body: "Bienvenido a nuestra plataforma.",
            }),
        ]);

        const templateHasConflictSpy = jest.spyOn(NotificationTemplate.prototype, "hasConflict").mockReturnValue(false);

        try {
            const result = await useCase.execute(makeInput());

            expect(notificationTemplateRepository.create).toHaveBeenCalledTimes(1);
            expect(result).toBe("template-id");
        } finally {
            templateHasConflictSpy.mockRestore();
        }
    });

    it("should create a template when there are no active candidates", async () => {
        const { useCase, notificationTemplateRepository } = makeSut();

        notificationTemplateRepository.findActiveByCombinationCandidates.mockResolvedValue([]);

        const result = await useCase.execute(makeInput());

        expect(notificationTemplateRepository.create).toHaveBeenCalledTimes(1);
        expect(result).toBe("template-id");
    });

    it("should propagate tenant API errors", async () => {
        const { useCase, tenantApi, generateMock, notificationTemplateRepository } = makeSut();

        tenantApi.isPlatformTenant.mockRejectedValue(new Error("Tenant API error"));

        await expect(useCase.execute(makeInput())).rejects.toThrow("Tenant API error");

        expect(generateMock).not.toHaveBeenCalled();
        expect(notificationTemplateRepository.findActiveByCombinationCandidates).not.toHaveBeenCalled();
        expect(notificationTemplateRepository.create).not.toHaveBeenCalled();
    });

    it("should propagate repository errors when finding conflict candidates", async () => {
        const { useCase, notificationTemplateRepository } = makeSut();

        notificationTemplateRepository.findActiveByCombinationCandidates.mockRejectedValue(new Error("Database error"));

        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");

        expect(notificationTemplateRepository.create).not.toHaveBeenCalled();
    });

    it("should propagate repository errors when creating the template", async () => {
        const { useCase, notificationTemplateRepository } = makeSut();

        notificationTemplateRepository.create.mockRejectedValue(new Error("Database error"));

        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
    });
});

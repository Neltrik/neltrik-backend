import { ForbiddenError } from "@/shared/errors";

import { NotificationTemplate } from "../../../../domain/entities";
import { NotificationTemplateAlreadyExistsError, NotificationTemplateNotFoundError } from "../../../../domain/errors";
import { NotificationTemplateRepositorySpy, TenantApiSpy } from "../../../../test-doubles";
import { ActivateNotificationTemplateUseCase } from "./index";
import type { ActivateNotificationTemplateInput } from "./input";

const makeInput = (): ActivateNotificationTemplateInput => ({ id: "template-id", actorTenantId: "tenant-id" });

describe("ActivateNotificationTemplateUseCase", () => {
    const makeTemplate = (tenantId: string | null = "tenant-id", isActive = false) =>
        NotificationTemplate.restore({
            id: "template-id",
            tenantId,
            code: "WELCOME",
            channel: "EMAIL",
            locale: "en",
            subject: "Welcome",
            body: "Welcome to our platform.",
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive,
        });

    const makeSut = () => {
        const tenantApi = new TenantApiSpy();
        tenantApi.isPlatformTenant.mockResolvedValue(false);
        const notificationTemplateRepository = new NotificationTemplateRepositorySpy();
        notificationTemplateRepository.findById.mockResolvedValue(makeTemplate());
        notificationTemplateRepository.findActiveByCombinationCandidates.mockResolvedValue([]);
        notificationTemplateRepository.update.mockResolvedValue(undefined);
        const useCase = new ActivateNotificationTemplateUseCase(tenantApi, notificationTemplateRepository);
        return { useCase, tenantApi, notificationTemplateRepository };
    };

    it("should activate a notification template successfully", async () => {
        const { useCase, tenantApi, notificationTemplateRepository } = makeSut();
        const input = makeInput();
        const result = await useCase.execute(input);
        expect(notificationTemplateRepository.findById).toHaveBeenCalledWith(input.id);
        expect(tenantApi.isPlatformTenant).toHaveBeenCalledWith(input.actorTenantId);
        expect(notificationTemplateRepository.findActiveByCombinationCandidates).toHaveBeenCalledWith(
            "WELCOME",
            "EMAIL",
            "en",
            "tenant-id",
            "template-id",
        );
        expect(notificationTemplateRepository.update).toHaveBeenCalledTimes(1);
        expect(notificationTemplateRepository.update).toHaveBeenCalledWith(expect.objectContaining({ id: input.id }));
        expect(result).toBe(input.id);
    });

    it("should allow a platform actor to activate a template from another tenant", async () => {
        const { useCase, tenantApi, notificationTemplateRepository } = makeSut();
        tenantApi.isPlatformTenant.mockResolvedValue(true);
        notificationTemplateRepository.findById.mockResolvedValue(makeTemplate("another-tenant-id"));
        const input = { ...makeInput(), actorTenantId: "platform-tenant-id" };
        const result = await useCase.execute(input);
        expect(tenantApi.isPlatformTenant).toHaveBeenCalledWith(input.actorTenantId);
        expect(notificationTemplateRepository.update).toHaveBeenCalledTimes(1);
        expect(result).toBe(input.id);
    });

    it("should return the template id without updating when the template is already active", async () => {
        const { useCase, notificationTemplateRepository } = makeSut();
        notificationTemplateRepository.findById.mockResolvedValue(makeTemplate("tenant-id", true));
        const result = await useCase.execute(makeInput());
        expect(notificationTemplateRepository.findActiveByCombinationCandidates).not.toHaveBeenCalled();
        expect(notificationTemplateRepository.update).not.toHaveBeenCalled();
        expect(result).toBe("template-id");
    });

    it("should throw NotificationTemplateNotFoundError when the template does not exist", async () => {
        const { useCase, tenantApi, notificationTemplateRepository } = makeSut();
        notificationTemplateRepository.findById.mockResolvedValue(null);
        await expect(useCase.execute(makeInput())).rejects.toThrow(NotificationTemplateNotFoundError);
        expect(tenantApi.isPlatformTenant).not.toHaveBeenCalled();
        expect(notificationTemplateRepository.update).not.toHaveBeenCalled();
    });

    it("should throw ForbiddenError when a non-platform actor activates another tenant's template", async () => {
        const { useCase, notificationTemplateRepository } = makeSut();
        notificationTemplateRepository.findById.mockResolvedValue(makeTemplate("another-tenant-id"));
        const input = { ...makeInput(), actorTenantId: "tenant-a" };
        await expect(useCase.execute(input)).rejects.toThrow(ForbiddenError);
        expect(notificationTemplateRepository.findActiveByCombinationCandidates).not.toHaveBeenCalled();
        expect(notificationTemplateRepository.update).not.toHaveBeenCalled();
    });

    it("should throw ForbiddenError when a non-platform actor activates a platform template", async () => {
        const { useCase, notificationTemplateRepository } = makeSut();
        notificationTemplateRepository.findById.mockResolvedValue(makeTemplate(null));
        await expect(useCase.execute(makeInput())).rejects.toThrow(ForbiddenError);
        expect(notificationTemplateRepository.findActiveByCombinationCandidates).not.toHaveBeenCalled();
        expect(notificationTemplateRepository.update).not.toHaveBeenCalled();
    });

    it("should throw NotificationTemplateAlreadyExistsError when an active conflict exists", async () => {
        const { useCase, notificationTemplateRepository } = makeSut();
        const template = makeTemplate();
        const candidate = NotificationTemplate.restore({
            id: "existing-template-id",
            tenantId: "tenant-id",
            code: "WELCOME",
            channel: "EMAIL",
            locale: "en",
            subject: "Another welcome",
            body: "Another message.",
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true,
        });
        notificationTemplateRepository.findById.mockResolvedValue(template);
        notificationTemplateRepository.findActiveByCombinationCandidates.mockResolvedValue([candidate]);
        jest.spyOn(template, "hasConflict").mockReturnValue(true);
        await expect(useCase.execute(makeInput())).rejects.toThrow(NotificationTemplateAlreadyExistsError);
        expect(notificationTemplateRepository.update).not.toHaveBeenCalled();
    });

    it("should activate the template when candidates do not conflict", async () => {
        const { useCase, notificationTemplateRepository } = makeSut();
        notificationTemplateRepository.findActiveByCombinationCandidates.mockResolvedValue([
            NotificationTemplate.create({
                id: "other-template-id",
                tenantId: "tenant-id",
                code: "OTHER_CODE",
                channel: "EMAIL",
                locale: "en",
                subject: "Other",
                body: "Another template.",
                createdAt: new Date(),
            }),
        ]);
        const result = await useCase.execute(makeInput());
        expect(notificationTemplateRepository.update).toHaveBeenCalledTimes(1);
        expect(result).toBe("template-id");
    });

    it("should propagate repository errors when finding the template", async () => {
        const { useCase, notificationTemplateRepository } = makeSut();
        notificationTemplateRepository.findById.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(notificationTemplateRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate repository errors when finding conflict candidates", async () => {
        const { useCase, notificationTemplateRepository } = makeSut();
        notificationTemplateRepository.findActiveByCombinationCandidates.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(notificationTemplateRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate repository errors when updating the template", async () => {
        const { useCase, notificationTemplateRepository } = makeSut();
        notificationTemplateRepository.update.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
    });
});

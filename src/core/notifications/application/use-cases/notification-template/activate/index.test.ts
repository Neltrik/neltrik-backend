import { ForbiddenError } from "@/shared/errors";

import { NotificationTemplate } from "../../../../domain/entities";
import { NotificationTemplateAlreadyExistsError, NotificationTemplateNotFoundError } from "../../../../domain/errors";
import { NotificationTemplateRepositorySpy, TenantApiSpy } from "../../../../test-doubles";
import { ActivateNotificationTemplateUseCase } from "./index";
import type { ActivateNotificationTemplateInput } from "./input";

jest.mock("sanitize-html", () => jest.fn((html: string) => html));

const makeInput = (): ActivateNotificationTemplateInput => ({
    id: "template-id",
    actorTenantId: "tenant-id",
});

describe("ActivateNotificationTemplateUseCase", () => {
    const makeTemplate = (tenantId: string | null = "tenant-id", isActive = false) =>
        NotificationTemplate.restore({
            id: "template-id",
            tenantId,
            code: "EMAIL_VERIFICATION",
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
            "EMAIL_VERIFICATION",
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
        expect(notificationTemplateRepository.findActiveByCombinationCandidates).toHaveBeenCalledWith(
            "EMAIL_VERIFICATION",
            "EMAIL",
            "en",
            "another-tenant-id",
            "template-id",
        );
        expect(notificationTemplateRepository.update).toHaveBeenCalledTimes(1);
        expect(result).toBe(input.id);
    });

    it("should allow a platform actor to activate a platform template", async () => {
        const { useCase, tenantApi, notificationTemplateRepository } = makeSut();
        tenantApi.isPlatformTenant.mockResolvedValue(true);
        notificationTemplateRepository.findById.mockResolvedValue(makeTemplate(null));
        const result = await useCase.execute({ ...makeInput(), actorTenantId: "platform-tenant-id" });
        expect(notificationTemplateRepository.findActiveByCombinationCandidates).toHaveBeenCalledWith(
            "EMAIL_VERIFICATION",
            "EMAIL",
            "en",
            null,
            "template-id",
        );
        expect(notificationTemplateRepository.update).toHaveBeenCalledTimes(1);
        expect(result).toBe("template-id");
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
        expect(notificationTemplateRepository.findActiveByCombinationCandidates).not.toHaveBeenCalled();
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
            code: "EMAIL_VERIFICATION",
            channel: "EMAIL",
            locale: "en",
            subject: "Another welcome",
            body: "Another message.",
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true,
        });
        jest.spyOn(template, "hasConflict").mockReturnValue(true);
        notificationTemplateRepository.findById.mockResolvedValue(template);
        notificationTemplateRepository.findActiveByCombinationCandidates.mockResolvedValue([candidate]);
        await expect(useCase.execute(makeInput())).rejects.toThrow(NotificationTemplateAlreadyExistsError);
        expect(template.hasConflict).toHaveBeenCalledWith(candidate);
        expect(notificationTemplateRepository.update).not.toHaveBeenCalled();
    });

    it("should activate the template when candidates do not conflict", async () => {
        const { useCase, notificationTemplateRepository } = makeSut();
        const template = makeTemplate();
        const candidate = NotificationTemplate.restore({
            id: "other-template-id",
            tenantId: "tenant-id",
            code: "EMAIL_VERIFICATION",
            channel: "EMAIL",
            locale: "en",
            subject: "Other",
            body: "Another template.",
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true,
        });
        jest.spyOn(template, "hasConflict").mockReturnValue(false);
        notificationTemplateRepository.findById.mockResolvedValue(template);
        notificationTemplateRepository.findActiveByCombinationCandidates.mockResolvedValue([candidate]);
        const result = await useCase.execute(makeInput());
        expect(template.hasConflict).toHaveBeenCalledWith(candidate);
        expect(notificationTemplateRepository.update).toHaveBeenCalledTimes(1);
        expect(notificationTemplateRepository.update).toHaveBeenCalledWith(template);
        expect(template.isActive()).toBe(true);
        expect(result).toBe("template-id");
    });

    it("should activate the template when there are no active candidates", async () => {
        const { useCase, notificationTemplateRepository } = makeSut();
        const template = makeTemplate();
        notificationTemplateRepository.findById.mockResolvedValue(template);
        notificationTemplateRepository.findActiveByCombinationCandidates.mockResolvedValue([]);
        const result = await useCase.execute(makeInput());
        expect(template.isActive()).toBe(true);
        expect(notificationTemplateRepository.update).toHaveBeenCalledWith(template);
        expect(result).toBe("template-id");
    });

    it("should throw NotificationTemplateAlreadyExistsError when any candidate conflicts", async () => {
        const { useCase, notificationTemplateRepository } = makeSut();
        const template = makeTemplate();
        const candidateWithoutConflict = NotificationTemplate.restore({
            id: "candidate-1",
            tenantId: "tenant-id",
            code: "EMAIL_VERIFICATION",
            channel: "EMAIL",
            locale: "en",
            subject: "Other subject",
            body: "Other body.",
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true,
        });
        const conflictingCandidate = NotificationTemplate.restore({
            id: "candidate-2",
            tenantId: "tenant-id",
            code: "EMAIL_VERIFICATION",
            channel: "EMAIL",
            locale: "en",
            subject: "Conflicting subject",
            body: "Conflicting body.",
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true,
        });
        jest.spyOn(template, "hasConflict").mockReturnValueOnce(false).mockReturnValueOnce(true);
        notificationTemplateRepository.findById.mockResolvedValue(template);
        notificationTemplateRepository.findActiveByCombinationCandidates.mockResolvedValue([
            candidateWithoutConflict,
            conflictingCandidate,
        ]);
        await expect(useCase.execute(makeInput())).rejects.toThrow(NotificationTemplateAlreadyExistsError);
        expect(template.hasConflict).toHaveBeenNthCalledWith(1, candidateWithoutConflict);
        expect(template.hasConflict).toHaveBeenNthCalledWith(2, conflictingCandidate);
        expect(notificationTemplateRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate repository errors when finding the template", async () => {
        const { useCase, tenantApi, notificationTemplateRepository } = makeSut();
        notificationTemplateRepository.findById.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(tenantApi.isPlatformTenant).not.toHaveBeenCalled();
        expect(notificationTemplateRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate tenant API errors", async () => {
        const { useCase, tenantApi, notificationTemplateRepository } = makeSut();
        tenantApi.isPlatformTenant.mockRejectedValue(new Error("Tenant API error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Tenant API error");
        expect(notificationTemplateRepository.findActiveByCombinationCandidates).not.toHaveBeenCalled();
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

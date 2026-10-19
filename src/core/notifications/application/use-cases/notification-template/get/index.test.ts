import { ForbiddenError } from "@/shared/errors/http-errors/forbidden";

import type { NotificationTemplate } from "../../../../domain/entities";
import { NotificationTemplateNotFoundError } from "../../../../domain/errors";
import { NotificationTemplateRepositorySpy, TenantApiSpy } from "../../../../test-doubles";
import { GetNotificationTemplateUseCase } from "./index";
import type { GetNotificationTemplateInput } from "./input";

describe("GetNotificationTemplateUseCase", () => {
    const makeSut = () => {
        const tenantApi = new TenantApiSpy();
        const notificationTemplateRepository = new NotificationTemplateRepositorySpy();
        const useCase = new GetNotificationTemplateUseCase(tenantApi, notificationTemplateRepository);
        return { useCase, tenantApi, notificationTemplateRepository };
    };

    const makeInput = (): GetNotificationTemplateInput => ({ id: "template-id", actorTenantId: "tenant-id" });

    const makeTemplate = (tenantId: string | null = "tenant-id"): NotificationTemplate =>
        ({
            id: "template-id",
            tenantId,
        }) as NotificationTemplate;

    it("should return the template when it belongs to the actor tenant", async () => {
        const { useCase, tenantApi, notificationTemplateRepository } = makeSut();
        const input = makeInput();
        const template = makeTemplate();
        notificationTemplateRepository.findById.mockResolvedValue(template);
        tenantApi.isPlatformTenant.mockResolvedValue(false);
        const result = await useCase.execute(input);
        expect(notificationTemplateRepository.findById).toHaveBeenCalledTimes(1);
        expect(notificationTemplateRepository.findById).toHaveBeenCalledWith(input.id);
        expect(tenantApi.isPlatformTenant).toHaveBeenCalledTimes(1);
        expect(tenantApi.isPlatformTenant).toHaveBeenCalledWith(input.actorTenantId);
        expect(result).toBe(template);
    });

    it("should return the template when the actor is a platform tenant", async () => {
        const { useCase, tenantApi, notificationTemplateRepository } = makeSut();
        const input = makeInput();
        const template = makeTemplate("another-tenant-id");
        notificationTemplateRepository.findById.mockResolvedValue(template);
        tenantApi.isPlatformTenant.mockResolvedValue(true);
        const result = await useCase.execute(input);
        expect(notificationTemplateRepository.findById).toHaveBeenCalledTimes(1);
        expect(notificationTemplateRepository.findById).toHaveBeenCalledWith(input.id);
        expect(tenantApi.isPlatformTenant).toHaveBeenCalledTimes(1);
        expect(tenantApi.isPlatformTenant).toHaveBeenCalledWith(input.actorTenantId);
        expect(result).toBe(template);
    });

    it("should return the global template when its tenantId is null", async () => {
        const { useCase, tenantApi, notificationTemplateRepository } = makeSut();
        const input = makeInput();
        const template = makeTemplate(null);
        notificationTemplateRepository.findById.mockResolvedValue(template);
        tenantApi.isPlatformTenant.mockResolvedValue(false);
        const result = await useCase.execute(input);
        expect(notificationTemplateRepository.findById).toHaveBeenCalledTimes(1);
        expect(tenantApi.isPlatformTenant).toHaveBeenCalledTimes(1);
        expect(result).toBe(template);
    });

    it("should throw NotificationTemplateNotFoundError when the template does not exist", async () => {
        const { useCase, tenantApi, notificationTemplateRepository } = makeSut();
        const input = makeInput();
        notificationTemplateRepository.findById.mockResolvedValue(null);
        await expect(useCase.execute(input)).rejects.toThrow(NotificationTemplateNotFoundError);
        expect(notificationTemplateRepository.findById).toHaveBeenCalledTimes(1);
        expect(notificationTemplateRepository.findById).toHaveBeenCalledWith(input.id);
        expect(tenantApi.isPlatformTenant).not.toHaveBeenCalled();
    });

    it("should throw ForbiddenError when the template belongs to another tenant and the actor is not a platform tenant", async () => {
        const { useCase, tenantApi, notificationTemplateRepository } = makeSut();
        const input = makeInput();
        const template = makeTemplate("another-tenant-id");
        notificationTemplateRepository.findById.mockResolvedValue(template);
        tenantApi.isPlatformTenant.mockResolvedValue(false);
        await expect(useCase.execute(input)).rejects.toThrow(ForbiddenError);
        expect(notificationTemplateRepository.findById).toHaveBeenCalledTimes(1);
        expect(notificationTemplateRepository.findById).toHaveBeenCalledWith(input.id);
        expect(tenantApi.isPlatformTenant).toHaveBeenCalledTimes(1);
        expect(tenantApi.isPlatformTenant).toHaveBeenCalledWith(input.actorTenantId);
    });

    it("should propagate repository errors when finding the template", async () => {
        const { useCase, tenantApi, notificationTemplateRepository } = makeSut();
        const input = makeInput();
        notificationTemplateRepository.findById.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(input)).rejects.toThrow("Database error");
        expect(notificationTemplateRepository.findById).toHaveBeenCalledTimes(1);
        expect(notificationTemplateRepository.findById).toHaveBeenCalledWith(input.id);
        expect(tenantApi.isPlatformTenant).not.toHaveBeenCalled();
    });

    it("should propagate errors when checking whether the actor is a platform tenant", async () => {
        const { useCase, tenantApi, notificationTemplateRepository } = makeSut();
        const input = makeInput();
        const template = makeTemplate();
        notificationTemplateRepository.findById.mockResolvedValue(template);
        tenantApi.isPlatformTenant.mockRejectedValue(new Error("Tenant API error"));
        await expect(useCase.execute(input)).rejects.toThrow("Tenant API error");
        expect(notificationTemplateRepository.findById).toHaveBeenCalledTimes(1);
        expect(tenantApi.isPlatformTenant).toHaveBeenCalledTimes(1);
        expect(tenantApi.isPlatformTenant).toHaveBeenCalledWith(input.actorTenantId);
    });
});

import { ForbiddenError } from "@/shared/errors";

import { NotificationTemplate } from "../../../../domain/entities";
import { NotificationTemplateNotFoundError } from "../../../../domain/errors";
import { NotificationTemplateRepositorySpy, TenantApiSpy } from "../../../../test-doubles";
import { DesactivateNotificationTemplateUseCase } from "./index";
import type { DesactivateNotificationTemplateInput } from "./input";

jest.mock("sanitize-html", () => jest.fn((html: string) => html));

const makeInput = (): DesactivateNotificationTemplateInput => ({
    id: "template-id",
    actorTenantId: "tenant-id",
});

describe("DesactivateNotificationTemplateUseCase", () => {
    const makeTemplate = (tenantId: string | null = "tenant-id", isActive = true) =>
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
        notificationTemplateRepository.update.mockResolvedValue(undefined);

        const useCase = new DesactivateNotificationTemplateUseCase(tenantApi, notificationTemplateRepository);

        return { useCase, tenantApi, notificationTemplateRepository };
    };

    it("should desactivate a notification template successfully", async () => {
        const { useCase, tenantApi, notificationTemplateRepository } = makeSut();
        const input = makeInput();

        const result = await useCase.execute(input);

        expect(notificationTemplateRepository.findById).toHaveBeenCalledWith(input.id);
        expect(tenantApi.isPlatformTenant).toHaveBeenCalledWith(input.actorTenantId);
        expect(notificationTemplateRepository.update).toHaveBeenCalledTimes(1);
        expect(notificationTemplateRepository.update).toHaveBeenCalledWith(expect.objectContaining({ id: input.id }));
        expect(result).toBe(input.id);
    });

    it("should allow a platform actor to desactivate a template from another tenant", async () => {
        const { useCase, tenantApi, notificationTemplateRepository } = makeSut();

        tenantApi.isPlatformTenant.mockResolvedValue(true);
        notificationTemplateRepository.findById.mockResolvedValue(makeTemplate("another-tenant-id"));

        const input = {
            ...makeInput(),
            actorTenantId: "platform-tenant-id",
        };

        const result = await useCase.execute(input);

        expect(tenantApi.isPlatformTenant).toHaveBeenCalledWith(input.actorTenantId);
        expect(notificationTemplateRepository.update).toHaveBeenCalledTimes(1);
        expect(result).toBe(input.id);
    });

    it("should allow a platform actor to desactivate a platform template", async () => {
        const { useCase, tenantApi, notificationTemplateRepository } = makeSut();

        tenantApi.isPlatformTenant.mockResolvedValue(true);
        notificationTemplateRepository.findById.mockResolvedValue(makeTemplate(null));

        const input = {
            ...makeInput(),
            actorTenantId: "platform-tenant-id",
        };

        const result = await useCase.execute(input);

        expect(tenantApi.isPlatformTenant).toHaveBeenCalledWith(input.actorTenantId);
        expect(notificationTemplateRepository.update).toHaveBeenCalledTimes(1);
        expect(result).toBe(input.id);
    });

    it("should return the template id without updating when the template is already inactive", async () => {
        const { useCase, notificationTemplateRepository } = makeSut();

        notificationTemplateRepository.findById.mockResolvedValue(makeTemplate("tenant-id", false));

        const result = await useCase.execute(makeInput());

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

    it("should throw ForbiddenError when a non-platform actor desactivates another tenant's template", async () => {
        const { useCase, notificationTemplateRepository } = makeSut();

        notificationTemplateRepository.findById.mockResolvedValue(makeTemplate("another-tenant-id"));

        const input = {
            ...makeInput(),
            actorTenantId: "tenant-a",
        };

        await expect(useCase.execute(input)).rejects.toThrow(ForbiddenError);

        expect(notificationTemplateRepository.update).not.toHaveBeenCalled();
    });

    it("should throw ForbiddenError when a non-platform actor desactivates a platform template", async () => {
        const { useCase, notificationTemplateRepository } = makeSut();

        notificationTemplateRepository.findById.mockResolvedValue(makeTemplate(null));

        await expect(useCase.execute(makeInput())).rejects.toThrow(ForbiddenError);

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

        expect(notificationTemplateRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate repository errors when updating the template", async () => {
        const { useCase, notificationTemplateRepository } = makeSut();

        notificationTemplateRepository.update.mockRejectedValue(new Error("Database error"));

        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
    });
});

import { ForbiddenError } from "@/shared/errors";

import { NotificationTemplate } from "../../../../domain/entities";
import { NotificationTemplateNotFoundError } from "../../../../domain/errors";
import { NotificationTemplateRepositorySpy, TenantApiSpy } from "../../../../test-doubles";
import { UpdateNotificationTemplateUseCase } from "./index";
import type { UpdateNotificationTemplateInput } from "./input";

const makeInput = (): UpdateNotificationTemplateInput => ({
    id: "template-id",
    actorTenantId: "tenant-id",
    subject: "Updated welcome",
    body: "Updated welcome message.",
});

describe("UpdateNotificationTemplateUseCase", () => {
    const makeTemplate = (tenantId: string | null = "tenant-id") =>
        NotificationTemplate.create({
            id: "template-id",
            tenantId,
            code: "WELCOME",
            channel: "EMAIL",
            locale: "en",
            subject: "Welcome",
            body: "Welcome to our platform.",
            createdAt: new Date(),
        });
    const makeSut = () => {
        const tenantApi = new TenantApiSpy();
        tenantApi.isPlatformTenant.mockResolvedValue(false);
        const notificationTemplateRepository = new NotificationTemplateRepositorySpy();
        notificationTemplateRepository.findById.mockResolvedValue(makeTemplate());
        notificationTemplateRepository.update.mockResolvedValue(undefined);
        const useCase = new UpdateNotificationTemplateUseCase(tenantApi, notificationTemplateRepository);
        return { useCase, tenantApi, notificationTemplateRepository };
    };

    it("should update a notification template successfully", async () => {
        const { useCase, tenantApi, notificationTemplateRepository } = makeSut();
        const input = makeInput();
        const result = await useCase.execute(input);
        expect(notificationTemplateRepository.findById).toHaveBeenCalledWith(input.id);
        expect(tenantApi.isPlatformTenant).toHaveBeenCalledWith(input.actorTenantId);
        expect(notificationTemplateRepository.update).toHaveBeenCalledTimes(1);
        expect(notificationTemplateRepository.update).toHaveBeenCalledWith(
            expect.objectContaining({ id: input.id, subject: input.subject, body: input.body }),
        );
        expect(result).toBe(input.id);
    });

    it("should allow a platform actor to update a template from another tenant", async () => {
        const { useCase, tenantApi, notificationTemplateRepository } = makeSut();
        tenantApi.isPlatformTenant.mockResolvedValue(true);
        notificationTemplateRepository.findById.mockResolvedValue(makeTemplate("another-tenant-id"));
        const input = { ...makeInput(), actorTenantId: "platform-tenant-id" };
        const result = await useCase.execute(input);
        expect(tenantApi.isPlatformTenant).toHaveBeenCalledWith(input.actorTenantId);
        expect(notificationTemplateRepository.update).toHaveBeenCalledTimes(1);
        expect(result).toBe(input.id);
    });

    it("should throw NotificationTemplateNotFoundError when the template does not exist", async () => {
        const { useCase, tenantApi, notificationTemplateRepository } = makeSut();
        notificationTemplateRepository.findById.mockResolvedValue(null);
        await expect(useCase.execute(makeInput())).rejects.toThrow(NotificationTemplateNotFoundError);
        expect(tenantApi.isPlatformTenant).not.toHaveBeenCalled();
        expect(notificationTemplateRepository.update).not.toHaveBeenCalled();
    });

    it("should throw ForbiddenError when a non-platform actor updates another tenant's template", async () => {
        const { useCase, notificationTemplateRepository } = makeSut();
        notificationTemplateRepository.findById.mockResolvedValue(makeTemplate("another-tenant-id"));
        const input = { ...makeInput(), actorTenantId: "tenant-a" };
        await expect(useCase.execute(input)).rejects.toThrow(ForbiddenError);
        expect(notificationTemplateRepository.update).not.toHaveBeenCalled();
    });

    it("should throw ForbiddenError when a non-platform actor updates a platform template", async () => {
        const { useCase, notificationTemplateRepository } = makeSut();
        notificationTemplateRepository.findById.mockResolvedValue(makeTemplate(null));
        await expect(useCase.execute(makeInput())).rejects.toThrow(ForbiddenError);
        expect(notificationTemplateRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate repository errors when finding the template", async () => {
        const { useCase, notificationTemplateRepository } = makeSut();
        notificationTemplateRepository.findById.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(notificationTemplateRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate repository errors when updating the template", async () => {
        const { useCase, notificationTemplateRepository } = makeSut();
        notificationTemplateRepository.update.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
    });
});

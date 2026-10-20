import type { NotificationTemplate } from "../../../../domain/entities";
import { NotificationTemplateNotFoundError } from "../../../../domain/errors";
import { NotificationTemplateRepositorySpy } from "../../../../test-doubles";
import { ResolveNotificationTemplateInternalUseCase } from "./index";
import type { ResolveNotificationTemplateInput } from "./input";

describe("ResolveNotificationTemplateInternalUseCase", () => {
    const makeSut = () => {
        const notificationTemplateRepository = new NotificationTemplateRepositorySpy();
        const useCase = new ResolveNotificationTemplateInternalUseCase(notificationTemplateRepository);
        return { useCase, notificationTemplateRepository };
    };

    const makeInput = (): ResolveNotificationTemplateInput => ({
        code: "WELCOME",
        channel: "EMAIL",
        locale: "es-CO",
        tenantId: "tenant-id",
    });

    it("should return the active template when it exists", async () => {
        const { useCase, notificationTemplateRepository } = makeSut();
        const input = makeInput();
        const template = {} as NotificationTemplate;
        notificationTemplateRepository.findActiveByCombination.mockResolvedValue(template);
        const result = await useCase.execute(input);
        expect(notificationTemplateRepository.findActiveByCombination).toHaveBeenCalledTimes(1);
        expect(notificationTemplateRepository.findActiveByCombination).toHaveBeenCalledWith(
            input.code,
            input.channel,
            input.locale,
            input.tenantId,
        );
        expect(result).toBe(template);
    });

    it("should throw NotificationTemplateNotFoundError when the template does not exist", async () => {
        const { useCase, notificationTemplateRepository } = makeSut();
        const input = makeInput();
        notificationTemplateRepository.findActiveByCombination.mockResolvedValue(null);
        await expect(useCase.execute(input)).rejects.toThrow(NotificationTemplateNotFoundError);
        expect(notificationTemplateRepository.findActiveByCombination).toHaveBeenCalledTimes(1);
        expect(notificationTemplateRepository.findActiveByCombination).toHaveBeenCalledWith(
            input.code,
            input.channel,
            input.locale,
            input.tenantId,
        );
    });

    it("should propagate repository errors when finding the template", async () => {
        const { useCase, notificationTemplateRepository } = makeSut();
        const input = makeInput();
        notificationTemplateRepository.findActiveByCombination.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(input)).rejects.toThrow("Database error");
        expect(notificationTemplateRepository.findActiveByCombination).toHaveBeenCalledTimes(1);
        expect(notificationTemplateRepository.findActiveByCombination).toHaveBeenCalledWith(
            input.code,
            input.channel,
            input.locale,
            input.tenantId,
        );
    });
});

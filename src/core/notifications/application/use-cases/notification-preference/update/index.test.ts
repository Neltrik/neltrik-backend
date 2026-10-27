import { ForbiddenError } from "@/shared/errors";

import { NotificationPreferenceNotFoundError } from "../../../../domain/errors";
import { type NotificationPreferenceRepository } from "../../../../domain/interfaces";
import { UpdateNotificationPreferenceUseCase } from ".";

describe("UpdateNotificationPreferenceUseCase", () => {
    let repository: jest.Mocked<NotificationPreferenceRepository>;
    let useCase: UpdateNotificationPreferenceUseCase;
    const baseInput = { actorTenantId: "tenant-1", actorUserId: "user-1", preferenceId: "pref-1", enabled: true };

    beforeEach(() => {
        repository = {
            findById: jest.fn(),
            update: jest.fn(),
        } as unknown as jest.Mocked<NotificationPreferenceRepository>;

        useCase = new UpdateNotificationPreferenceUseCase(repository);
    });

    it("throws NotFound when preference does not exist", async () => {
        repository.findById.mockResolvedValue(null);
        await expect(useCase.execute(baseInput)).rejects.toThrow(NotificationPreferenceNotFoundError);
        expect(repository.update).not.toHaveBeenCalled();
    });

    it("throws Forbidden when owner does not match", async () => {
        repository.findById.mockResolvedValue({ ownerId: "user-2" } as never);
        await expect(useCase.execute(baseInput)).rejects.toThrow(ForbiddenError);
        expect(repository.update).not.toHaveBeenCalled();
    });

    it("enables the preference when enabled is true", async () => {
        const preference = { id: "pref-1", ownerId: "user-1", enable: jest.fn(), disable: jest.fn() };
        repository.findById.mockResolvedValue(preference as never);
        repository.update.mockResolvedValue();
        const result = await useCase.execute(baseInput);
        expect(result).toBe("pref-1");
        expect(preference.enable).toHaveBeenCalledTimes(1);
        expect(preference.disable).not.toHaveBeenCalled();
        expect(repository.update).toHaveBeenCalledWith(preference);
    });

    it("disables the preference when enabled is false", async () => {
        const preference = { id: "pref-1", ownerId: "user-1", enable: jest.fn(), disable: jest.fn() };
        repository.findById.mockResolvedValue(preference as never);
        repository.update.mockResolvedValue();
        const result = await useCase.execute({ ...baseInput, enabled: false });
        expect(result).toBe("pref-1");
        expect(preference.disable).toHaveBeenCalledTimes(1);
        expect(preference.enable).not.toHaveBeenCalled();
        expect(repository.update).toHaveBeenCalledWith(preference);
    });
});

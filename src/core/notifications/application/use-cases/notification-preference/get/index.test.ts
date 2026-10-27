import { NotificationPreferenceNotFoundError } from "../../../../domain/errors";
import { type NotificationPreferenceRepository } from "../../../../domain/interfaces";
import { GetNotificationPreferenceUseCase } from ".";

describe("GetNotificationPreferenceUseCase", () => {
    let repository: jest.Mocked<NotificationPreferenceRepository>;
    let useCase: GetNotificationPreferenceUseCase;
    const baseInput = { actorTenantId: "tenant-1", actorUserId: "user-1", preferenceId: "pref-1" };

    beforeEach(() => {
        repository = { findById: jest.fn() } as unknown as jest.Mocked<NotificationPreferenceRepository>;
        useCase = new GetNotificationPreferenceUseCase(repository);
    });

    it("throws NotFound when preference does not exist", async () => {
        repository.findById.mockResolvedValue(null);
        await expect(useCase.execute(baseInput)).rejects.toThrow(NotificationPreferenceNotFoundError);
    });

    it("returns the preference when it exists", async () => {
        const preference = { id: "pref-1", ownerId: "user-1" } as never;
        repository.findById.mockResolvedValue(preference);
        const result = await useCase.execute(baseInput);
        expect(result).toBe(preference);
        expect(repository.findById).toHaveBeenCalledWith("pref-1");
    });
});

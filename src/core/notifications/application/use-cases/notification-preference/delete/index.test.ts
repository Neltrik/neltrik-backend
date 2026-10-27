import { ForbiddenError } from "@/shared/errors";

import { NotificationPreferenceNotFoundError } from "../../../../domain/errors";
import { type NotificationPreferenceRepository } from "../../../../domain/interfaces";
import { DeleteNotificationPreferenceUseCase } from ".";

describe("DeleteNotificationPreferenceUseCase", () => {
    let repository: jest.Mocked<NotificationPreferenceRepository>;
    let useCase: DeleteNotificationPreferenceUseCase;
    const baseInput = { actorTenantId: "tenant-1", actorUserId: "user-1", preferenceId: "pref-1" };

    beforeEach(() => {
        repository = {
            findById: jest.fn(),
            delete: jest.fn(),
        } as unknown as jest.Mocked<NotificationPreferenceRepository>;
        useCase = new DeleteNotificationPreferenceUseCase(repository);
    });

    it("throws NotFound when preference does not exist", async () => {
        repository.findById.mockResolvedValue(null);
        await expect(useCase.execute(baseInput)).rejects.toThrow(NotificationPreferenceNotFoundError);
    });

    it("throws Forbidden when owner does not match", async () => {
        repository.findById.mockResolvedValue({ ownerId: "user-2" } as never);
        await expect(useCase.execute(baseInput)).rejects.toThrow(ForbiddenError);
    });

    it("deletes the preference when owner matches", async () => {
        repository.findById.mockResolvedValue({ ownerId: "user-1" } as never);
        repository.delete.mockResolvedValue();
        const result = await useCase.execute(baseInput);
        expect(result).toEqual("pref-1");
        expect(repository.delete).toHaveBeenCalledWith("pref-1");
    });
});

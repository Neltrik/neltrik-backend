import type { NotificationPreferenceRepository } from "../../../../domain/interfaces";
import { NOTIFICATION_CATEGORY, NOTIFICATION_CHANNEL } from "../../../../domain/types";
import { ResolveNotificationPreferenceInternalUseCase } from ".";

describe("ResolveNotificationPreferenceInternalUseCase", () => {
    let repository: jest.Mocked<NotificationPreferenceRepository>;
    let useCase: ResolveNotificationPreferenceInternalUseCase;
    const baseInput = {
        ownerId: "user-1",
        channel: NOTIFICATION_CHANNEL.EMAIL,
        category: NOTIFICATION_CATEGORY.MARKETING,
    };

    beforeEach(() => {
        repository = {
            findByOwnerAndChannelAndCategory: jest.fn(),
        } as unknown as jest.Mocked<NotificationPreferenceRepository>;
        useCase = new ResolveNotificationPreferenceInternalUseCase(repository);
    });

    it("returns true when no preference exists (default)", async () => {
        repository.findByOwnerAndChannelAndCategory.mockResolvedValue(null);
        const result = await useCase.execute(baseInput);
        expect(result).toBe(true);
    });

    it("returns true when preference is enabled", async () => {
        repository.findByOwnerAndChannelAndCategory.mockResolvedValue({ isEnabled: () => true } as never);
        const result = await useCase.execute(baseInput);
        expect(result).toBe(true);
    });

    it("returns false when preference is disabled", async () => {
        repository.findByOwnerAndChannelAndCategory.mockResolvedValue({ isEnabled: () => false } as never);
        const result = await useCase.execute(baseInput);
        expect(result).toBe(false);
    });

    it("calls repository with ownerId, channel and category", async () => {
        repository.findByOwnerAndChannelAndCategory.mockResolvedValue(null);
        await useCase.execute(baseInput);
        expect(repository.findByOwnerAndChannelAndCategory).toHaveBeenCalledWith(
            "user-1",
            NOTIFICATION_CHANNEL.EMAIL,
            NOTIFICATION_CATEGORY.MARKETING,
        );
    });
});

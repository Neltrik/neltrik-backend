import { type NotificationPreferenceRepository } from "../../../../domain/interfaces";
import { ListNotificationPreferencesUseCase } from "./";
import { type ListNotificationPreferencesInput } from "./input";

describe("ListNotificationPreferencesUseCase", () => {
    let repository: jest.Mocked<NotificationPreferenceRepository>;
    let useCase: ListNotificationPreferencesUseCase;
    const baseInput: ListNotificationPreferencesInput = { actorUserId: "user-1", limit: 2, cursor: "" };

    beforeEach(() => {
        repository = { findByOwner: jest.fn() } as unknown as jest.Mocked<NotificationPreferenceRepository>;
        useCase = new ListNotificationPreferencesUseCase(repository);
    });

    it("returns empty list when no preferences", async () => {
        repository.findByOwner.mockResolvedValue([]);
        const result = await useCase.execute(baseInput);
        expect(result.preferences).toEqual([]);
        expect(result.meta.nextCursor).toBeNull();
        expect(result.meta.hasMore).toBe(false);
    });

    it("returns paginated preferences", async () => {
        const preferences = [{ id: "pref-1" }, { id: "pref-2" }] as never;
        repository.findByOwner.mockResolvedValue(preferences);
        const result = await useCase.execute({ ...baseInput, limit: 1 });
        expect(result.preferences).toHaveLength(1);
        expect(result.meta.hasMore).toBe(true);
    });

    it("calls repository with ownerId and pagination", async () => {
        repository.findByOwner.mockResolvedValue([]);
        await useCase.execute({ ...baseInput, cursor: "cursor-1", limit: 5 });
        expect(repository.findByOwner).toHaveBeenCalledWith({ ownerId: "user-1", cursor: "cursor-1", limit: 5 });
    });
});

import { type IdGenerator } from "@/shared/id-generator";

import { NotificationPreferenceAlreadyExistsError } from "../../../../domain/errors";
import { type NotificationPreferenceRepository } from "../../../../domain/interfaces";
import { CreateNotificationPreferenceUseCase } from ".";
import type { CreateNotificationPreferenceInput } from "./input";

jest.mock("sanitize-html", () => jest.fn((html: string) => html));

describe("CreateNotificationPreferenceUseCase", () => {
    let idGenerator: jest.Mocked<IdGenerator>;
    let repository: jest.Mocked<NotificationPreferenceRepository>;
    let useCase: CreateNotificationPreferenceUseCase;
    const baseInput = {
        actorTenantId: "tenant-1",
        actorUserId: "user-1",
        channel: "EMAIL",
        category: "TRANSACTIONAL",
    } as unknown as CreateNotificationPreferenceInput;

    beforeEach(() => {
        const generateMock = jest.fn().mockReturnValue("notification-preference-id");
        idGenerator = {
            generate: generateMock,
        } satisfies jest.Mocked<IdGenerator>;
        repository = {
            findByOwnerAndChannelAndCategory: jest.fn(),
            create: jest.fn(),
        } as unknown as jest.Mocked<NotificationPreferenceRepository>;
        useCase = new CreateNotificationPreferenceUseCase(idGenerator, repository);
    });

    it("throws AlreadyExists when preference already exists", async () => {
        repository.findByOwnerAndChannelAndCategory.mockResolvedValue({ id: "pref-1" } as never);
        await expect(useCase.execute(baseInput)).rejects.toThrow(NotificationPreferenceAlreadyExistsError);
        expect(repository.create).not.toHaveBeenCalled();
        expect(idGenerator.generate).not.toHaveBeenCalled();
    });

    it("creates the preference when it does not exist", async () => {
        repository.findByOwnerAndChannelAndCategory.mockResolvedValue(null);
        repository.create.mockResolvedValue();
        const result = await useCase.execute(baseInput);
        expect(result).toBe("notification-preference-id");
        expect(idGenerator.generate).toHaveBeenCalledTimes(1);
        expect(repository.findByOwnerAndChannelAndCategory).toHaveBeenCalledWith("user-1", "EMAIL", "TRANSACTIONAL");
        expect(repository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                id: "notification-preference-id",
                tenantId: "tenant-1",
                ownerId: "user-1",
                channel: "EMAIL",
                category: "TRANSACTIONAL",
            }),
        );
    });
});

import type { Notification } from "../../../../domain/entities";
import { NotificationRepositorySpy } from "../../../../test-doubles";
import { ListNotificationsUseCase } from "./index";
import type { ListNotificationsInput } from "./input";

jest.mock("sanitize-html", () => jest.fn((html: string) => html));

describe("ListNotificationsUseCase", () => {
    const makeSut = () => {
        const notificationRepository = new NotificationRepositorySpy();
        const useCase = new ListNotificationsUseCase(notificationRepository);
        return { useCase, notificationRepository };
    };
    const makeInput = (): ListNotificationsInput => ({
        actorTenantId: "tenant-id",
        actorUserId: "user-id",
        cursor: undefined,
        limit: 10,
    });
    const makeNotification = (id: string): Notification =>
        ({
            id,
        }) as Notification;

    it("should return notifications belonging to the actor tenant and recipient", async () => {
        const { useCase, notificationRepository } = makeSut();
        const input = makeInput();
        const notifications = [makeNotification("notification-1"), makeNotification("notification-2")];
        notificationRepository.findInAppByTenantAndRecipient.mockResolvedValue(notifications);
        const result = await useCase.execute(input);
        expect(notificationRepository.findInAppByTenantAndRecipient).toHaveBeenCalledTimes(1);
        expect(notificationRepository.findInAppByTenantAndRecipient).toHaveBeenCalledWith({
            tenantId: input.actorTenantId,
            recipientId: input.actorUserId,
            cursor: input.cursor,
            limit: input.limit,
        });
        expect(result.notifications).toEqual(notifications);
        expect(result.meta).toBeDefined();
    });

    it("should return an empty list when no notifications are found", async () => {
        const { useCase, notificationRepository } = makeSut();
        const input = makeInput();
        notificationRepository.findInAppByTenantAndRecipient.mockResolvedValue([]);
        const result = await useCase.execute(input);
        expect(notificationRepository.findInAppByTenantAndRecipient).toHaveBeenCalledTimes(1);
        expect(result.notifications).toEqual([]);
        expect(result.meta).toBeDefined();
    });

    it("should pass the cursor and limit to the repository", async () => {
        const { useCase, notificationRepository } = makeSut();
        const input: ListNotificationsInput = {
            actorTenantId: "tenant-id",
            actorUserId: "user-id",
            cursor: "notification-5",
            limit: 5,
        };
        notificationRepository.findInAppByTenantAndRecipient.mockResolvedValue([]);
        await useCase.execute(input);
        expect(notificationRepository.findInAppByTenantAndRecipient).toHaveBeenCalledWith({
            tenantId: input.actorTenantId,
            recipientId: input.actorUserId,
            cursor: input.cursor,
            limit: input.limit,
        });
    });

    it("should propagate repository errors when finding notifications", async () => {
        const { useCase, notificationRepository } = makeSut();
        const input = makeInput();
        notificationRepository.findInAppByTenantAndRecipient.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(input)).rejects.toThrow("Database error");
        expect(notificationRepository.findInAppByTenantAndRecipient).toHaveBeenCalledTimes(1);
        expect(notificationRepository.findInAppByTenantAndRecipient).toHaveBeenCalledWith({
            tenantId: input.actorTenantId,
            recipientId: input.actorUserId,
            cursor: input.cursor,
            limit: input.limit,
        });
    });

    it("should paginate notifications when there are more items than the limit", async () => {
        const { useCase, notificationRepository } = makeSut();
        const input: ListNotificationsInput = {
            actorTenantId: "tenant-id",
            actorUserId: "user-id",
            cursor: undefined,
            limit: 2,
        };
        const notifications = [
            makeNotification("notification-1"),
            makeNotification("notification-2"),
            makeNotification("notification-3"),
        ];
        notificationRepository.findInAppByTenantAndRecipient.mockResolvedValue(notifications);
        const result = await useCase.execute(input);
        expect(result.notifications).toHaveLength(2);
        expect(result.notifications).toEqual([notifications[0], notifications[1]]);
        expect(result.meta).toBeDefined();
    });

    it("should return all notifications when the number of items does not exceed the limit", async () => {
        const { useCase, notificationRepository } = makeSut();
        const input: ListNotificationsInput = {
            actorTenantId: "tenant-id",
            actorUserId: "user-id",
            cursor: undefined,
            limit: 3,
        };
        const notifications = [makeNotification("notification-1"), makeNotification("notification-2")];
        notificationRepository.findInAppByTenantAndRecipient.mockResolvedValue(notifications);
        const result = await useCase.execute(input);
        expect(result.notifications).toEqual(notifications);
        expect(result.notifications).toHaveLength(2);
        expect(result.meta).toBeDefined();
    });
});

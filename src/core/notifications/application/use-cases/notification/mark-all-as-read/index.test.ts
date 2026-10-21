import { NotificationRepositorySpy } from "../../../../test-doubles";
import { MarkAllNotificationsAsReadUseCase } from "./index";
import type { MarkAllNotificationsAsReadInput } from "./input";

describe("MarkAllNotificationsAsReadUseCase", () => {
    const makeSut = () => {
        const notificationRepository = new NotificationRepositorySpy();
        const markAllNotificationsAsReadUseCase = new MarkAllNotificationsAsReadUseCase(notificationRepository);
        return { markAllNotificationsAsReadUseCase, notificationRepository };
    };

    const makeInput = (): MarkAllNotificationsAsReadInput => ({
        actorTenantId: "tenant-id",
        actorUserId: "user-id",
    });

    describe("execute", () => {
        it("should mark all in-app notifications as read and return the updated count", async () => {
            const { markAllNotificationsAsReadUseCase, notificationRepository } = makeSut();
            const input = makeInput();
            notificationRepository.markAllInAppAsRead.mockResolvedValue(5);
            await expect(markAllNotificationsAsReadUseCase.execute(input)).resolves.toBe(5);
            expect(notificationRepository.markAllInAppAsRead).toHaveBeenCalledTimes(1);
            expect(notificationRepository.markAllInAppAsRead).toHaveBeenCalledWith(
                input.actorTenantId,
                input.actorUserId,
            );
        });

        it("should return zero when there are no notifications to update", async () => {
            const { markAllNotificationsAsReadUseCase, notificationRepository } = makeSut();
            const input = makeInput();
            notificationRepository.markAllInAppAsRead.mockResolvedValue(0);
            await expect(markAllNotificationsAsReadUseCase.execute(input)).resolves.toBe(0);
            expect(notificationRepository.markAllInAppAsRead).toHaveBeenCalledTimes(1);
            expect(notificationRepository.markAllInAppAsRead).toHaveBeenCalledWith(
                input.actorTenantId,
                input.actorUserId,
            );
        });

        it("should propagate errors when marking notifications as read", async () => {
            const { markAllNotificationsAsReadUseCase, notificationRepository } = makeSut();
            const input = makeInput();
            notificationRepository.markAllInAppAsRead.mockRejectedValue(
                new Error("Failed to mark notifications as read"),
            );
            await expect(markAllNotificationsAsReadUseCase.execute(input)).rejects.toThrow(
                "Failed to mark notifications as read",
            );
            expect(notificationRepository.markAllInAppAsRead).toHaveBeenCalledTimes(1);
            expect(notificationRepository.markAllInAppAsRead).toHaveBeenCalledWith(
                input.actorTenantId,
                input.actorUserId,
            );
        });
    });
});

import { ForbiddenError } from "@/shared/errors";

import type { Notification } from "../../../../domain/entities";
import { NotificationNotFoundError } from "../../../../domain/errors";
import { NotificationRepositorySpy } from "../../../../test-doubles";
import { MarkNotificationAsReadUseCase } from "./index";
import type { MarkNotificationAsReadInput } from "./input";

jest.mock("sanitize-html", () => jest.fn((html: string) => html));

describe("MarkNotificationAsReadUseCase", () => {
    const makeSut = () => {
        const notificationRepository = new NotificationRepositorySpy();
        const useCase = new MarkNotificationAsReadUseCase(notificationRepository);
        return { useCase, notificationRepository };
    };
    const makeInput = (): MarkNotificationAsReadInput => ({
        notificationId: "notification-id",
        actorTenantId: "tenant-id",
        actorUserId: "user-id",
    });

    const makeNotification = (id = "notification-id", recipientId = "user-id"): Notification =>
        ({ id, recipientId, markAsRead: jest.fn() }) as unknown as Notification;

    it("should mark the notification as read and return its ID", async () => {
        const { useCase, notificationRepository } = makeSut();
        const input = makeInput();
        const notification = makeNotification();
        notificationRepository.findById.mockResolvedValue(notification);
        notificationRepository.update.mockResolvedValue(undefined);
        const result = await useCase.execute(input);
        expect(notificationRepository.findById).toHaveBeenCalledTimes(1);
        expect(notificationRepository.findById).toHaveBeenCalledWith(input.notificationId);
        expect(notification.markAsRead).toHaveBeenCalledTimes(1);
        expect(notificationRepository.update).toHaveBeenCalledTimes(1);
        expect(notificationRepository.update).toHaveBeenCalledWith(notification);
        expect(result).toBe(notification.id);
    });

    it("should throw NotificationNotFoundError when the notification does not exist", async () => {
        const { useCase, notificationRepository } = makeSut();
        const input = makeInput();
        notificationRepository.findById.mockResolvedValue(null);
        await expect(useCase.execute(input)).rejects.toThrow(NotificationNotFoundError);
        expect(notificationRepository.findById).toHaveBeenCalledTimes(1);
        expect(notificationRepository.findById).toHaveBeenCalledWith(input.notificationId);
        expect(notificationRepository.update).not.toHaveBeenCalled();
    });

    it("should throw ForbiddenError when the notification belongs to another recipient", async () => {
        const { useCase, notificationRepository } = makeSut();
        const input = makeInput();
        const notification = makeNotification("notification-id", "another-user-id");
        notificationRepository.findById.mockResolvedValue(notification);
        await expect(useCase.execute(input)).rejects.toThrow(ForbiddenError);
        expect(notificationRepository.findById).toHaveBeenCalledWith(input.notificationId);
        expect(notification.markAsRead).not.toHaveBeenCalled();
        expect(notificationRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate repository errors when finding the notification", async () => {
        const { useCase, notificationRepository } = makeSut();
        const input = makeInput();
        notificationRepository.findById.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(input)).rejects.toThrow("Database error");
        expect(notificationRepository.findById).toHaveBeenCalledTimes(1);
        expect(notificationRepository.findById).toHaveBeenCalledWith(input.notificationId);
        expect(notificationRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate repository errors when updating the notification", async () => {
        const { useCase, notificationRepository } = makeSut();
        const input = makeInput();
        const notification = makeNotification();
        notificationRepository.findById.mockResolvedValue(notification);
        notificationRepository.update.mockRejectedValue(new Error("Update error"));
        await expect(useCase.execute(input)).rejects.toThrow("Update error");
        expect(notification.markAsRead).toHaveBeenCalledTimes(1);
        expect(notificationRepository.update).toHaveBeenCalledTimes(1);
        expect(notificationRepository.update).toHaveBeenCalledWith(notification);
    });

    it("should mark the notification as read before updating it", async () => {
        const { useCase, notificationRepository } = makeSut();
        const input = makeInput();
        const markAsRead = jest.fn();
        const notification = { ...makeNotification(), markAsRead } as unknown as Notification;
        notificationRepository.findById.mockResolvedValue(notification);
        notificationRepository.update.mockResolvedValue(undefined);
        await useCase.execute(input);
        expect(markAsRead).toHaveBeenCalledTimes(1);
        expect(notificationRepository.update).toHaveBeenCalledTimes(1);
        const markAsReadCallOrder = markAsRead.mock.invocationCallOrder[0];
        const updateCallOrder = notificationRepository.update.mock.invocationCallOrder[0];
        expect(markAsReadCallOrder).toBeDefined();
        expect(updateCallOrder).toBeDefined();
        if (markAsReadCallOrder === undefined || updateCallOrder === undefined) {
            throw new Error("Expected both methods to have been called");
        }
        expect(markAsReadCallOrder).toBeLessThan(updateCallOrder);
    });
});

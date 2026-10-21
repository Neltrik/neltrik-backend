import type { JobContext, JobPayload } from "@/shared/jobs";

import type { SendNotificationJobsUseCase } from "../../../application/jobs";
import { SEND_NOTIFICATION_JOB, SEND_NOTIFICATION_QUEUE } from "../../../domain/types";
import { SendNotificationHandler } from "./index";

describe("SendNotificationHandler", () => {
    const makeSut = () => {
        const sendNotificationJobsUseCase = {
            execute: jest.fn().mockResolvedValue(undefined),
        } as unknown as jest.Mocked<SendNotificationJobsUseCase>;
        const handler = new SendNotificationHandler(sendNotificationJobsUseCase);
        const payload: JobPayload = { notificationId: "notification-id" };
        const ctx = {} as JobContext;
        return { handler, sendNotificationJobsUseCase, payload, ctx };
    };

    it("should expose the correct queue and job name", () => {
        const { handler } = makeSut();
        expect(handler.queue).toBe(SEND_NOTIFICATION_QUEUE);
        expect(handler.name).toBe(SEND_NOTIFICATION_JOB);
    });

    it("should send notification successfully", async () => {
        const { handler, sendNotificationJobsUseCase, payload, ctx } = makeSut();
        await expect(handler.handle(payload, ctx)).resolves.toBeUndefined();
        expect(sendNotificationJobsUseCase.execute).toHaveBeenCalledTimes(1);
        expect(sendNotificationJobsUseCase.execute).toHaveBeenCalledWith({ notificationId: "notification-id" });
    });

    it("should extract notificationId from the job payload", async () => {
        const { handler, sendNotificationJobsUseCase, ctx } = makeSut();
        const payload = { notificationId: "custom-notification-id" } as JobPayload;
        await handler.handle(payload, ctx);
        expect(sendNotificationJobsUseCase.execute).toHaveBeenCalledWith({ notificationId: "custom-notification-id" });
    });

    it("should propagate errors from the send notification use case", async () => {
        const { handler, sendNotificationJobsUseCase, payload, ctx } = makeSut();
        sendNotificationJobsUseCase.execute.mockRejectedValue(new Error("Notification sending failed"));
        await expect(handler.handle(payload, ctx)).rejects.toThrow("Notification sending failed");
        expect(sendNotificationJobsUseCase.execute).toHaveBeenCalledTimes(1);
        expect(sendNotificationJobsUseCase.execute).toHaveBeenCalledWith({ notificationId: "notification-id" });
    });

    it("should not swallow errors from the send notification use case", async () => {
        const { handler, sendNotificationJobsUseCase, payload, ctx } = makeSut();
        const error = new Error("Template resolution failed");
        sendNotificationJobsUseCase.execute.mockRejectedValue(error);
        await expect(handler.handle(payload, ctx)).rejects.toBe(error);
    });

    it("should pass only notificationId to the use case", async () => {
        const { handler, sendNotificationJobsUseCase, ctx } = makeSut();
        const payload = { notificationId: "notification-id", extraProperty: "ignored" } as JobPayload;
        await handler.handle(payload, ctx);
        expect(sendNotificationJobsUseCase.execute).toHaveBeenCalledWith({ notificationId: "notification-id" });
    });
});

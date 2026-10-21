import { SendNotificationOhsUseCaseSpy } from "../../test-doubles";
import { NotificationApiImpl } from "./index";
import { SendNotificationDto } from "./result.dto";

describe("NotificationApiImpl", () => {
    const makeSut = () => {
        const sendNotificationOhsUseCase = new SendNotificationOhsUseCaseSpy();
        const notificationApi = new NotificationApiImpl(sendNotificationOhsUseCase);
        return { notificationApi, sendNotificationOhsUseCase };
    };

    const makeInput = (): SendNotificationDto => ({
        tenantId: "tenant-id",
        recipientId: "recipient-id",
        recipientEmail: "recipient@example.com",
        code: "USER_CREATED",
        channels: ["EMAIL"] as SendNotificationDto["channels"],
        payload: { name: "John Doe" },
        locale: "en",
    });

    describe("send", () => {
        it("should send the notification successfully and return its id", async () => {
            const { notificationApi, sendNotificationOhsUseCase } = makeSut();
            const input = makeInput();
            sendNotificationOhsUseCase.execute.mockResolvedValue("notification-id");
            await expect(notificationApi.send(input)).resolves.toBe("notification-id");
            expect(sendNotificationOhsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(sendNotificationOhsUseCase.execute).toHaveBeenCalledWith({
                tenantId: input.tenantId,
                recipientId: input.recipientId,
                recipientEmail: input.recipientEmail,
                code: input.code,
                channels: input.channels,
                payload: input.payload,
                locale: input.locale,
            });
        });

        it("should send the notification when the recipient email is null", async () => {
            const { notificationApi, sendNotificationOhsUseCase } = makeSut();
            const input = { ...makeInput(), recipientEmail: null };
            sendNotificationOhsUseCase.execute.mockResolvedValue("notification-id");
            await expect(notificationApi.send(input)).resolves.toBe("notification-id");
            expect(sendNotificationOhsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(sendNotificationOhsUseCase.execute).toHaveBeenCalledWith({
                tenantId: input.tenantId,
                recipientId: input.recipientId,
                recipientEmail: null,
                code: input.code,
                channels: input.channels,
                payload: input.payload,
                locale: input.locale,
            });
        });

        it("should propagate notification sending errors", async () => {
            const { notificationApi, sendNotificationOhsUseCase } = makeSut();
            const input = makeInput();
            sendNotificationOhsUseCase.execute.mockRejectedValue(new Error("Failed to send notification"));
            await expect(notificationApi.send(input)).rejects.toThrow("Failed to send notification");
            expect(sendNotificationOhsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(sendNotificationOhsUseCase.execute).toHaveBeenCalledWith({
                tenantId: input.tenantId,
                recipientId: input.recipientId,
                recipientEmail: input.recipientEmail,
                code: input.code,
                channels: input.channels,
                payload: input.payload,
                locale: input.locale,
            });
        });
    });
});

describe("SendNotificationDto", () => {
    it("should create a notification result dto", () => {
        const dto = new SendNotificationDto();
        dto.tenantId = "tenant-id";
        dto.recipientId = "recipient-id";
        dto.recipientEmail = "recipient@example.com";
        dto.code = "USER_CREATED";
        dto.channels = ["EMAIL"] as SendNotificationDto["channels"];
        dto.payload = { name: "John Doe" };
        dto.locale = "en";

        expect(dto).toEqual({
            tenantId: "tenant-id",
            recipientId: "recipient-id",
            recipientEmail: "recipient@example.com",
            code: "USER_CREATED",
            channels: ["EMAIL"],
            payload: { name: "John Doe" },
            locale: "en",
        });
    });
});

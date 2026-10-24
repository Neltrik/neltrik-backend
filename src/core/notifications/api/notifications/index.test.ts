import { SendNotificationOhsUseCaseSpy } from "../../test-doubles";
import {
    LOCALES,
    NOTIFICATION_CHANNEL,
    NOTIFICATION_CODES,
    NOTIFICATION_VARIABLES,
    NotificationApiImpl,
} from "./index";
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
        code: NOTIFICATION_CODES.EMAIL_VERIFICATION,
        channels: [NOTIFICATION_CHANNEL.EMAIL] as SendNotificationDto["channels"],
        payload: { name: "John Doe" },
        locale: LOCALES.ES_CO,
    });

    const makeExpectedInput = (input: SendNotificationDto) => ({
        tenantId: input.tenantId,
        recipientId: input.recipientId,
        recipientEmail: input.recipientEmail,
        code: input.code,
        channels: input.channels,
        payload: input.payload,
        locale: input.locale,
    });

    describe("send", () => {
        it("should send the notification successfully and return its id", async () => {
            const { notificationApi, sendNotificationOhsUseCase } = makeSut();
            const input = makeInput();
            sendNotificationOhsUseCase.execute.mockResolvedValue("notification-id");
            await expect(notificationApi.send(input)).resolves.toBe("notification-id");
            expect(sendNotificationOhsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(sendNotificationOhsUseCase.execute).toHaveBeenCalledWith(makeExpectedInput(input));
        });

        it("should send the notification when the recipient email is null", async () => {
            const { notificationApi, sendNotificationOhsUseCase } = makeSut();
            const input = { ...makeInput(), recipientEmail: null };
            sendNotificationOhsUseCase.execute.mockResolvedValue("notification-id");
            await expect(notificationApi.send(input)).resolves.toBe("notification-id");
            expect(sendNotificationOhsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(sendNotificationOhsUseCase.execute).toHaveBeenCalledWith(makeExpectedInput(input));
        });

        it("should propagate notification sending errors", async () => {
            const { notificationApi, sendNotificationOhsUseCase } = makeSut();
            const input = makeInput();
            const error = new Error("Failed to send notification");
            sendNotificationOhsUseCase.execute.mockRejectedValue(error);
            await expect(notificationApi.send(input)).rejects.toBe(error);
            expect(sendNotificationOhsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(sendNotificationOhsUseCase.execute).toHaveBeenCalledWith(makeExpectedInput(input));
            input.tenantId = NOTIFICATION_VARIABLES.EMAIL_VERIFICATION[0];
        });
    });
});

describe("SendNotificationDto", () => {
    it("should create a notification result dto", () => {
        const dto = new SendNotificationDto();
        dto.tenantId = "tenant-id";
        dto.recipientId = "recipient-id";
        dto.recipientEmail = "recipient@example.com";
        dto.code = "EMAIL_VERIFICATION";
        dto.channels = ["EMAIL"] as SendNotificationDto["channels"];
        dto.payload = { name: "John Doe" };
        dto.locale = "es-CO";
        expect(dto).toEqual({
            tenantId: "tenant-id",
            recipientId: "recipient-id",
            recipientEmail: "recipient@example.com",
            code: "EMAIL_VERIFICATION",
            channels: ["EMAIL"],
            payload: { name: "John Doe" },
            locale: "es-CO",
        });
    });
});

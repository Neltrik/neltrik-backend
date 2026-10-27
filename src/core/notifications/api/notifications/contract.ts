import { type SendNotificationDto } from "./result.dto";

export abstract class NotificationApi {
    public abstract send(input: SendNotificationDto): Promise<string | null>;
}

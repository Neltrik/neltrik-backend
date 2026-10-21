import { Injectable } from "@nestjs/common";

import { SendNotificationOhsUseCase } from "../../application/use-cases-ohs";
import { NotificationApi } from "./contract";
import { SendNotificationDto } from "./result.dto";

@Injectable()
export class NotificationApiImpl extends NotificationApi {
    constructor(private readonly sendNotificationOhsUseCase: SendNotificationOhsUseCase) {
        super();
    }

    public async send(input: SendNotificationDto): Promise<string> {
        const id = await this.sendNotificationOhsUseCase.execute({
            tenantId: input.tenantId,
            recipientId: input.recipientId,
            recipientEmail: input.recipientEmail,
            code: input.code,
            channels: input.channels,
            payload: input.payload,
            locale: input.locale,
        });
        return id;
    }
}

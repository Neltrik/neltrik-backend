import { Injectable } from "@nestjs/common";

import { JobContext, JobHandler, JobPayload, RegisterJobHandler } from "@/shared/jobs";

import { SendNotificationJobsUseCase } from "../../../application/jobs";
import { SEND_NOTIFICATION_JOB, SEND_NOTIFICATION_QUEUE, SendNotificationJobPayload } from "../../../domain/types";

@RegisterJobHandler()
@Injectable()
export class SendNotificationHandler implements JobHandler {
    readonly queue = SEND_NOTIFICATION_QUEUE;
    readonly name = SEND_NOTIFICATION_JOB;

    constructor(private readonly sendNotificationJobsUseCase: SendNotificationJobsUseCase) {}

    public async handle(payload: JobPayload, _ctx: JobContext): Promise<void> {
        const { notificationId } = payload as SendNotificationJobPayload;
        await this.sendNotificationJobsUseCase.execute({ notificationId });
    }
}

import { Injectable } from "@nestjs/common";

import { JobScheduler } from "@/shared/jobs";
import { type OutboxEventRecord, OutboxHandler } from "@/shared/outbox";

import { buildFileScanJobId, FILE_SCAN_JOB, FILE_SCAN_JOB_OPTIONS, FILE_SCAN_QUEUE } from "../../../domain/types";

@Injectable()
export class FileScanOutboxHandler extends OutboxHandler {
    public readonly eventType = "FILE_SCAN";

    constructor(private readonly jobScheduler: JobScheduler) {
        super();
    }

    public async handle(event: OutboxEventRecord): Promise<void> {
        const { tenantId, fileId, version } = event.payload as { tenantId: string; fileId: string; version: number };
        await this.jobScheduler.enqueue(
            FILE_SCAN_QUEUE,
            FILE_SCAN_JOB,
            { tenantId, fileId, version },
            { ...FILE_SCAN_JOB_OPTIONS, jobId: buildFileScanJobId(fileId, version) },
        );
    }
}

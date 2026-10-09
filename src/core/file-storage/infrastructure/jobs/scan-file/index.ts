import { Injectable } from "@nestjs/common";

import { TenantContextService } from "@/prisma/index";
import { JobContext, JobHandler, RegisterJobHandler } from "@/shared/jobs";

import { ScanFileJobsUseCase } from "../../../application/jobs";
import { FILE_SCAN_JOB, FILE_SCAN_QUEUE, ScanFilePayload } from "../../../domain/types";

@RegisterJobHandler()
@Injectable()
export class ScanFileHandler implements JobHandler<string, ScanFilePayload> {
    readonly queue = FILE_SCAN_QUEUE;
    readonly name = FILE_SCAN_JOB;

    constructor(
        private readonly tenantContext: TenantContextService,
        private readonly scanFileJobsUseCase: ScanFileJobsUseCase,
    ) {}

    public async handle(payload: ScanFilePayload, _ctx: JobContext): Promise<void> {
        await this.tenantContext.runWithContext(payload.tenantId, null, false, async () => {
            await this.scanFileJobsUseCase.execute({
                tenantId: payload.tenantId,
                fileId: payload.fileId,
                version: payload.version,
            });
        });
    }
}

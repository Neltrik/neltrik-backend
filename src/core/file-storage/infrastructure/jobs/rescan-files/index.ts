import { Injectable } from "@nestjs/common";

import { env } from "@/config/index";
import { TenantApi } from "@/core/tenant/api";
import { TenantContextService } from "@/prisma/index";
import { JobContext, JobHandler, JobPayload, RegisterJobHandler } from "@/shared/jobs";

import { RescanFilesJobsUseCase } from "../../../application/jobs";
import { RESCAN_FILES_JOB, RESCAN_FILES_QUEUE } from "../../../domain/types";

@RegisterJobHandler()
@Injectable()
export class RescanFilesHandler implements JobHandler {
    readonly queue = RESCAN_FILES_QUEUE;
    readonly name = RESCAN_FILES_JOB;

    constructor(
        private readonly tenantApi: TenantApi,
        private readonly tenantContext: TenantContextService,
        private readonly rescanFilesJobsUseCase: RescanFilesJobsUseCase,
    ) {}

    public async handle(_payload: JobPayload, _ctx: JobContext): Promise<void> {
        const tenants = await this.tenantApi.list();
        for (const tenant of tenants) {
            await this.tenantContext.runWithContext(tenant.id, null, false, async () => {
                await this.rescanFilesJobsUseCase.execute({
                    tenantId: tenant.id,
                    ageDays: env.RESCAN_AGE_DAYS,
                    dryRun: env.RESCAN_DRY_RUN,
                });
            });
        }
    }
}

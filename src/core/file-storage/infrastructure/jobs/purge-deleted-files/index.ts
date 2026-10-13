import { Injectable } from "@nestjs/common";

import { env } from "@/config/index";
import { TenantApi } from "@/core/tenant/api";
import { TenantContextService } from "@/prisma/index";
import { JobContext, JobHandler, JobPayload, RegisterJobHandler } from "@/shared/jobs";

import { PurgeDeletedFilesJobsUseCase } from "../../../application/jobs";
import { PURGE_DELETED_FILES_JOB, PURGE_DELETED_FILES_QUEUE } from "../../../domain/types";

@RegisterJobHandler()
@Injectable()
export class PurgeDeletedFilesHandler implements JobHandler {
    readonly queue = PURGE_DELETED_FILES_QUEUE;
    readonly name = PURGE_DELETED_FILES_JOB;

    constructor(
        private readonly tenantApi: TenantApi,
        private readonly tenantContext: TenantContextService,
        private readonly purgeDeletedFilesJobsUseCase: PurgeDeletedFilesJobsUseCase,
    ) {}

    public async handle(_payload: JobPayload, _ctx: JobContext): Promise<void> {
        const tenants = await this.tenantApi.list();
        for (const tenant of tenants) {
            await this.tenantContext.runWithContext(tenant.id, null, false, async () => {
                await this.purgeDeletedFilesJobsUseCase.execute({
                    tenantId: tenant.id,
                    dryRun: env.FILE_DELETION_DRY_RUN,
                    graceDays: env.FILE_DELETION_GRACE_DAYS,
                });
            });
        }
    }
}

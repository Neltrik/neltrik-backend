import { Injectable } from "@nestjs/common";

import { env } from "@/config/index";
import { RECONCILE_STORAGE_JOB, RECONCILE_STORAGE_QUEUE } from "@/core/file-storage/domain/types";
import { TenantApi } from "@/core/tenant/api";
import { TenantContextService } from "@/prisma/index";
import { JobContext, JobHandler, JobPayload, RegisterJobHandler } from "@/shared/jobs";

import { ReconcileStorageJobsUseCase } from "../../../application/jobs";

@RegisterJobHandler()
@Injectable()
export class ReconcileStorageHandler implements JobHandler {
    readonly queue = RECONCILE_STORAGE_QUEUE;
    readonly name = RECONCILE_STORAGE_JOB;

    constructor(
        private readonly tenantApi: TenantApi,
        private readonly tenantContext: TenantContextService,
        private readonly reconcileStorageJobsUseCase: ReconcileStorageJobsUseCase,
    ) {}

    public async handle(_payload: JobPayload, _ctx: JobContext): Promise<void> {
        const tenants = await this.tenantApi.list();
        for (const tenant of tenants) {
            await this.tenantContext.runWithContext(tenant.id, null, false, async () => {
                await this.reconcileStorageJobsUseCase.execute({
                    tenantId: tenant.id,
                    dryRun: env.RECONCILE_DRY_RUN,
                });
            });
        }
    }
}

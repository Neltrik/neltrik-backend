import type { TransactionContext } from "@/shared/transaction";

import type { FileQuota } from "../../entities";

export abstract class FileQuotaRepository {
    abstract create(quota: FileQuota): Promise<void>;
    abstract findByTenantId(tenantId: string): Promise<FileQuota | null>;
    abstract update(quota: FileQuota, context?: TransactionContext): Promise<void>;
}

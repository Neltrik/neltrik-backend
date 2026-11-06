import type { TransactionContext } from "@/shared/transaction";

import type { FileQuota } from "../../entities";

export abstract class FileQuotaRepository {
    abstract create(quota: FileQuota): Promise<FileQuota>;
    abstract findByTenantId(tenantId: string): Promise<FileQuota | null>;
    abstract update(quota: FileQuota, context?: TransactionContext): Promise<void>;
    abstract incrementUsedBytes(tenantId: string, delta: number, context?: TransactionContext): Promise<void>;
    abstract decrementUsedBytes(tenantId: string, delta: number, context?: TransactionContext): Promise<void>;
}

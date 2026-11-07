import type { TransactionContext } from "@/shared/transaction";

import type { OutboxEvent, OutboxEventRecord } from "../types";

export abstract class OutboxRepository {
    abstract create(event: OutboxEvent, context?: TransactionContext): Promise<void>;
    abstract findPending(limit: number): Promise<OutboxEventRecord[]>;
    abstract markProcessed(id: string): Promise<void>;
    abstract markFailed(id: string, error: string): Promise<void>;
}

import type { OutboxEventRecord } from "../types";

export abstract class OutboxHandler {
    abstract readonly eventType: string;
    abstract handle(event: OutboxEventRecord): Promise<void>;
}

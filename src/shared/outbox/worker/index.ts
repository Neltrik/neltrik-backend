import { Injectable } from "@nestjs/common";

import { OutboxRepository } from "../contracts";
import { HandlersRegistry } from "../handlers-registry";

@Injectable()
export class OutboxWorker {
    constructor(
        private readonly outboxRepository: OutboxRepository,
        private readonly handlersRegistry: HandlersRegistry,
    ) {}

    public async process(limit: number = 10): Promise<void> {
        const events = await this.outboxRepository.findPending(limit);
        for (const event of events) {
            const handler = this.handlersRegistry.get(event.eventType);
            if (!handler) {
                await this.outboxRepository.markFailed(event.id, `No handler for ${event.eventType}`);
                continue;
            }
            try {
                await handler.handle(event);
                await this.outboxRepository.markProcessed(event.id);
            } catch (error) {
                await this.outboxRepository.markFailed(event.id, (error as Error).message);
            }
        }
    }
}

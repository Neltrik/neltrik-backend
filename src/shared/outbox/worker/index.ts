import { Injectable } from "@nestjs/common";

import { OutboxHandler, OutboxRepository } from "../contracts";

@Injectable()
export class OutboxWorker {
    constructor(
        private readonly outboxRepository: OutboxRepository,
        private readonly handler: OutboxHandler,
    ) {}

    public async process(limit: number = 10): Promise<void> {
        const events = await this.outboxRepository.findPending(limit);
        for (const event of events) {
            if (event.eventType !== this.handler.eventType) {
                await this.outboxRepository.markFailed(event.id, `No handler for ${event.eventType}`);
                continue;
            }
            try {
                await this.handler.handle(event);
                await this.outboxRepository.markProcessed(event.id);
            } catch (error) {
                await this.outboxRepository.markFailed(event.id, (error as Error).message);
            }
        }
    }
}

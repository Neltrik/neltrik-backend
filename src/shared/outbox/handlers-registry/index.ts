import { Injectable } from "@nestjs/common";

import { OutboxHandler } from "../contracts";

@Injectable()
export class HandlersRegistry {
    private readonly handlers = new Map<string, OutboxHandler>();

    public register(handler: OutboxHandler): void {
        this.handlers.set(handler.eventType, handler);
    }

    public get(eventType: string): OutboxHandler | undefined {
        return this.handlers.get(eventType);
    }
}

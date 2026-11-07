import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";

import { OutboxWorker } from "../worker";

@Injectable()
export class OutboxScheduler implements OnModuleInit, OnModuleDestroy {
    private interval?: NodeJS.Timeout;

    constructor(private readonly outboxWorker: OutboxWorker) {}

    public onModuleInit(): void {
        this.interval = setInterval(() => {
            void this.outboxWorker.process(10);
        }, 5000);
    }

    public onModuleDestroy(): void {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
}

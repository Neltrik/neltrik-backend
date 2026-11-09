import { Module } from "@nestjs/common";

import { PrismaModule } from "@/prisma/index";

import { OutboxRepository } from "./contracts";
import { HandlersRegistry } from "./handlers-registry";
import { PrismaOutboxRepository } from "./infrastructure";
import { OutboxWorker } from "./worker";

@Module({
    imports: [PrismaModule],
    providers: [{ provide: OutboxRepository, useClass: PrismaOutboxRepository }, HandlersRegistry, OutboxWorker],
    exports: [OutboxRepository, HandlersRegistry, OutboxWorker],
})
export class OutboxModule {}

import { Module } from "@nestjs/common";

import { PrismaModule } from "@/prisma/index";

import { OutboxRepository } from "./contracts";
import { PrismaOutboxRepository } from "./infrastructure";

@Module({
    imports: [PrismaModule],
    providers: [{ provide: OutboxRepository, useClass: PrismaOutboxRepository }],
    exports: [OutboxRepository],
})
export class OutboxModule {}

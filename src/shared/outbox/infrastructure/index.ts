import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "@/prisma/index";
import { TransactionContext } from "@/shared/transaction";

import { OutboxRepository } from "../contracts";
import type { OutboxEvent, OutboxEventRecord } from "../types";

@Injectable()
export class PrismaOutboxRepository extends OutboxRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    public async create(event: OutboxEvent, context?: TransactionContext): Promise<void> {
        const prisma = context ? context.get<Prisma.TransactionClient>() : this.prisma.tenantClient;
        await prisma.outbox.create({
            data: { eventType: event.eventType, payload: event.payload as Prisma.InputJsonValue },
        });
    }

    public async findPending(limit: number): Promise<OutboxEventRecord[]> {
        const records = await this.prisma.tenantClient.outbox.findMany({
            where: { status: "PENDING" },
            orderBy: { createdAt: "asc" },
            take: limit,
        });
        return records.map((record) => ({
            id: record.id,
            eventType: record.eventType,
            payload: record.payload as Record<string, unknown>,
            attempts: record.attempts,
            createdAt: record.createdAt,
        }));
    }

    public async markProcessed(id: string): Promise<void> {
        await this.prisma.tenantClient.outbox.update({
            where: { id },
            data: { status: "PROCESSED", processedAt: new Date() },
        });
    }

    public async markFailed(id: string, error: string): Promise<void> {
        await this.prisma.tenantClient.outbox.update({
            where: { id },
            data: { status: "FAILED", lastError: error, attempts: { increment: 1 } },
        });
    }
}

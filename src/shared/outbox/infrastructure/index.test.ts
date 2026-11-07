import { type PrismaService } from "@/prisma/index";
import { type TransactionContext } from "@/shared/transaction";

import { PrismaOutboxRepository } from "./";

describe("PrismaOutboxRepository", () => {
    let repository: PrismaOutboxRepository;
    let prisma: {
        tenantClient: {
            outbox: { create: jest.Mock; findMany: jest.Mock; update: jest.Mock };
        };
    };

    beforeEach(() => {
        prisma = {
            tenantClient: {
                outbox: {
                    create: jest.fn().mockResolvedValue(undefined),
                    findMany: jest.fn().mockResolvedValue([]),
                    update: jest.fn().mockResolvedValue(undefined),
                },
            },
        };
        repository = new PrismaOutboxRepository(prisma as unknown as PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("create", () => {
        it("should create an outbox event using tenant client when context is not provided", async () => {
            const event = { eventType: "USER_CREATED", payload: { userId: "user-123" } };
            await repository.create(event);
            expect(prisma.tenantClient.outbox.create).toHaveBeenCalledWith({
                data: { eventType: "USER_CREATED", payload: { userId: "user-123" } },
            });
        });

        it("should create an outbox event using transaction context when provided", async () => {
            const transactionClient = {
                outbox: { create: jest.fn().mockResolvedValue(undefined) },
            };
            const context = {
                get: jest.fn().mockReturnValue(transactionClient),
            } as unknown as TransactionContext;
            const event = { eventType: "USER_CREATED", payload: { userId: "user-123" } };
            await repository.create(event, context);
            expect(context.get).toHaveBeenCalled();
            expect(transactionClient.outbox.create).toHaveBeenCalledWith({
                data: { eventType: "USER_CREATED", payload: { userId: "user-123" } },
            });
            expect(prisma.tenantClient.outbox.create).not.toHaveBeenCalled();
        });
    });

    describe("findPending", () => {
        it("should return pending outbox events", async () => {
            const createdAt = new Date();
            prisma.tenantClient.outbox.findMany.mockResolvedValue([
                {
                    id: "event-123",
                    eventType: "USER_CREATED",
                    payload: { userId: "user-123" },
                    attempts: 0,
                    createdAt,
                    status: "PENDING",
                },
            ]);
            const result = await repository.findPending(10);
            expect(result).toEqual([
                {
                    id: "event-123",
                    eventType: "USER_CREATED",
                    payload: { userId: "user-123" },
                    attempts: 0,
                    createdAt,
                },
            ]);
            expect(prisma.tenantClient.outbox.findMany).toHaveBeenCalledWith({
                where: { status: "PENDING" },
                orderBy: { createdAt: "asc" },
                take: 10,
            });
        });

        it("should return an empty array when there are no pending events", async () => {
            const result = await repository.findPending(10);
            expect(result).toEqual([]);
        });

        it("should respect the provided limit", async () => {
            await repository.findPending(5);
            expect(prisma.tenantClient.outbox.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 5 }));
        });
    });

    describe("markProcessed", () => {
        it("should mark an outbox event as processed", async () => {
            const id = "event-123";
            const processedAt = new Date("2026-01-01T00:00:00.000Z");
            jest.useFakeTimers();
            jest.setSystemTime(processedAt);
            await repository.markProcessed(id);
            expect(prisma.tenantClient.outbox.update).toHaveBeenCalledWith({
                where: { id },
                data: { status: "PROCESSED", processedAt },
            });
            jest.useRealTimers();
        });
    });

    describe("markFailed", () => {
        it("should mark an outbox event as failed and increment attempts", async () => {
            const id = "event-123";
            const error = "Processing failed";
            await repository.markFailed(id, error);
            expect(prisma.tenantClient.outbox.update).toHaveBeenCalledWith({
                where: { id },
                data: { status: "FAILED", lastError: error, attempts: { increment: 1 } },
            });
        });
    });
});

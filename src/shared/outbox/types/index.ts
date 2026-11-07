export type OutboxEvent = {
    eventType: string;
    payload: Record<string, unknown>;
};

export type OutboxEventRecord = {
    id: string;
    eventType: string;
    payload: Record<string, unknown>;
    attempts: number;
    createdAt: Date;
};

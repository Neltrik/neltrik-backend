export interface ListSessionsOutput {
    sessions: Array<{
        id: string;
        ipAddress: string | null;
        userAgent: string | null;
        lastUsedAt: Date | null;
        createdAt: Date;
        expiresAt: Date;
        isRevoked: boolean;
    }>;
}

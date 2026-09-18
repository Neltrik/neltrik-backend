export interface AuditMetadata {
    action: string;
    resource: string;
}

export interface AuditRecordInput extends AuditMetadata {
    resourceId: string | null;
    userId: string | null;
    userEmail: string | null;
    tenantId: string | null;
    status: string;
    metadata?: Record<string, unknown>;
}

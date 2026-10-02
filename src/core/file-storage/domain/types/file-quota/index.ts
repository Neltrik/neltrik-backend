export interface FileQuotaProps {
    id: string;
    tenantId: string;
    limitBytes: number;
    usedBytes: number;
    createdAt: Date;
    updatedAt: Date;
}

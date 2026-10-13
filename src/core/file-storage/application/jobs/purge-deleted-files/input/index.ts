export interface PurgeDeletedFilesInput {
    tenantId: string;
    dryRun: boolean;
    graceDays: number;
}

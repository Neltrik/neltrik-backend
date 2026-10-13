import type { EnqueueOptions, JobPayload } from "@/shared/jobs";

export const FILE_SCAN_QUEUE = "file-scan";
export const FILE_SCAN_JOB = "scan";
export const RECONCILE_STORAGE_QUEUE = "file-reconcile-storage";
export const RECONCILE_STORAGE_JOB = "reconcile-storage";
export const PURGE_DELETED_FILES_QUEUE = "file-purge-deleted";
export const PURGE_DELETED_FILES_JOB = "purge-deleted-files";

export type ScanFilePayload = JobPayload & {
    tenantId: string;
    fileId: string;
    version: number;
};

export const FILE_SCAN_JOB_OPTIONS: EnqueueOptions = {
    attempts: 3,
    backoff: { type: "exponential", delayMs: 5000 },
};

export function buildFileScanJobId(fileId: string, version: number): string {
    return `${FILE_SCAN_QUEUE}:${fileId}:v${version}`;
}

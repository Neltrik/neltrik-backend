export interface GetFileQuotaOutput {
    limitBytes: number;
    usedBytes: number;
    availableBytes: number;
    isNearLimit: boolean;
    isOverLimit: boolean;
}

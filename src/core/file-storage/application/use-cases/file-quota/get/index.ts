import { Injectable } from "@nestjs/common";

import { FileQuotaRepository } from "../../../../domain/interfaces";
import { DEFAULT_FILE_QUOTA_LIMIT_BYTES } from "../../../constants";
import { GetFileQuotaOutput } from "./output";

@Injectable()
export class GetFileQuotaUseCase {
    constructor(private readonly fileQuotaRepository: FileQuotaRepository) {}

    public async execute(tenantId: string): Promise<GetFileQuotaOutput> {
        const quota = await this.fileQuotaRepository.findByTenantId(tenantId);
        if (!quota) {
            return {
                limitBytes: DEFAULT_FILE_QUOTA_LIMIT_BYTES,
                usedBytes: 0,
                availableBytes: DEFAULT_FILE_QUOTA_LIMIT_BYTES,
                isNearLimit: false,
                isOverLimit: false,
            };
        }
        return {
            limitBytes: quota.limitBytes,
            usedBytes: quota.usedBytes,
            availableBytes: quota.getAvailableBytes(),
            isNearLimit: quota.isNearLimit(),
            isOverLimit: quota.isOverLimit(),
        };
    }
}

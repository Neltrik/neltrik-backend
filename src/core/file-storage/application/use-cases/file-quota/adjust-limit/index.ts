import { Injectable } from "@nestjs/common";

import { FileQuota } from "../../../../domain/entities";
import { FileQuotaNotFoundError, QuotaLimitBelowMinimumError } from "../../../../domain/errors";
import { FileQuotaRepository } from "../../../../domain/interfaces";
import { MIN_FILE_QUOTA_LIMIT_BYTES } from "../../../constants";
import { type AdjustQuotaLimitInput } from "./input";

@Injectable()
export class AdjustQuotaLimitUseCase {
    constructor(private readonly fileQuotaRepository: FileQuotaRepository) {}

    public async execute(input: AdjustQuotaLimitInput): Promise<FileQuota> {
        const quota = await this.fileQuotaRepository.findByTenantId(input.tenantId);
        if (!quota) {
            throw new FileQuotaNotFoundError();
        }
        if (input.newLimitBytes < MIN_FILE_QUOTA_LIMIT_BYTES) {
            throw new QuotaLimitBelowMinimumError();
        }
        quota.adjustLimit(input.newLimitBytes);
        await this.fileQuotaRepository.update(quota);
        return quota;
    }
}

export { AdjustQuotaLimitInput };

import { Injectable } from "@nestjs/common";

import { FileQuota } from "../../../../domain/entities";
import { FileQuotaNotFoundError } from "../../../../domain/errors";
import { FileQuotaRepository } from "../../../../domain/interfaces";
import { type IncrementQuotaInput } from "./input";

@Injectable()
export class IncrementQuotaInternalUseCase {
    constructor(private readonly fileQuotaRepository: FileQuotaRepository) {}

    public async execute(input: IncrementQuotaInput): Promise<FileQuota> {
        const quota = await this.fileQuotaRepository.findByTenantId(input.tenantId);
        if (!quota) {
            throw new FileQuotaNotFoundError();
        }
        quota.increment(input.size);
        await this.fileQuotaRepository.update(quota);
        return quota;
    }
}

export { IncrementQuotaInput };

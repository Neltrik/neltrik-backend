import { Injectable } from "@nestjs/common";

import { TransactionContext } from "@/shared/transaction";

import { FileQuota } from "../../../../domain/entities";
import { FileQuotaNotFoundError } from "../../../../domain/errors";
import { FileQuotaRepository } from "../../../../domain/interfaces";
import { type IncrementQuotaInput } from "./input";

@Injectable()
export class IncrementQuotaInternalUseCase {
    constructor(private readonly fileQuotaRepository: FileQuotaRepository) {}

    public async execute(input: IncrementQuotaInput, context?: TransactionContext): Promise<FileQuota> {
        await this.fileQuotaRepository.incrementUsedBytes(input.tenantId, input.size, context);
        const quota = await this.fileQuotaRepository.findByTenantId(input.tenantId);
        if (!quota) {
            throw new FileQuotaNotFoundError();
        }
        return quota;
    }
}

export { IncrementQuotaInput };

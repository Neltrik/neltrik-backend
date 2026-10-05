import { Injectable } from "@nestjs/common";

import { type TransactionContext } from "@/shared/transaction";

import { FileQuota } from "../../../../domain/entities";
import { FileQuotaNotFoundError } from "../../../../domain/errors";
import { FileQuotaRepository } from "../../../../domain/interfaces";
import { type DecrementQuotaInput } from "./input";

@Injectable()
export class DecrementQuotaUseCase {
    constructor(private readonly fileQuotaRepository: FileQuotaRepository) {}

    public async execute(input: DecrementQuotaInput, context?: TransactionContext): Promise<FileQuota> {
        const quota = await this.fileQuotaRepository.findByTenantId(input.tenantId);
        if (!quota) {
            throw new FileQuotaNotFoundError();
        }
        quota.decrement(input.size);
        await this.fileQuotaRepository.update(quota, context);
        return quota;
    }
}

export { DecrementQuotaInput };

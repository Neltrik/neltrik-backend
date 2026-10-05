import { Injectable } from "@nestjs/common";

import { FileQuotaNotFoundError } from "../../../../domain/errors";
import { FileQuotaRepository } from "../../../../domain/interfaces";
import { type VerifyQuotaLimitInput } from "./input";

@Injectable()
export class VerifyQuotaLimitInternalUseCase {
    constructor(private readonly fileQuotaRepository: FileQuotaRepository) {}

    public async execute(input: VerifyQuotaLimitInput): Promise<boolean> {
        const quota = await this.fileQuotaRepository.findByTenantId(input.tenantId);
        if (!quota) {
            throw new FileQuotaNotFoundError();
        }
        return quota.canAccommodate(input.size);
    }
}

export { VerifyQuotaLimitInput };

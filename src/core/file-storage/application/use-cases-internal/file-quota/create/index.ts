import { Injectable } from "@nestjs/common";

import { IdGenerator } from "@/shared/id-generator";

import { FileQuota } from "../../../../domain/entities";
import { FileQuotaRepository } from "../../../../domain/interfaces";
import { DEFAULT_FILE_QUOTA_LIMIT_BYTES } from "../../../constants";

@Injectable()
export class CreateOrGetQuotaInternalUseCase {
    constructor(
        private readonly fileQuotaRepository: FileQuotaRepository,
        private readonly idGenerator: IdGenerator,
    ) {}

    public async execute(tenantId: string): Promise<FileQuota> {
        const existing = await this.fileQuotaRepository.findByTenantId(tenantId);
        if (existing) {
            return existing;
        }
        const id = this.idGenerator.generate();
        const now = new Date();
        const quota = FileQuota.create({ id, tenantId, limitBytes: DEFAULT_FILE_QUOTA_LIMIT_BYTES, createdAt: now });
        await this.fileQuotaRepository.create(quota);
        return quota;
    }
}

import { Injectable } from "@nestjs/common";

import { TransactionManager } from "@/shared/transaction";

import { FileNotFoundError } from "../../../../domain/errors";
import { FileRepository } from "../../../../domain/interfaces";
import { DecrementQuotaInternalUseCase } from "../../../use-cases-internal";
import { DeleteFileOutput } from "./output";

@Injectable()
export class DeleteFileUseCase {
    constructor(
        private readonly fileRepository: FileRepository,
        private readonly decrementQuotaInternalUseCase: DecrementQuotaInternalUseCase,
        private readonly transactionManager: TransactionManager,
    ) {}

    public async execute(fileId: string): Promise<DeleteFileOutput> {
        return this.transactionManager.execute(async (context) => {
            const file = await this.fileRepository.findById(fileId);
            if (!file) {
                throw new FileNotFoundError();
            }
            file.delete();
            await this.fileRepository.update(file, context);
            await this.decrementQuotaInternalUseCase.execute(
                { tenantId: file.tenantId, size: file.getTotalSize() },
                context,
            );
            return { id: file.id };
        });
    }
}

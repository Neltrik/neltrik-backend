import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class CompensatingOperationService {
    private readonly logger = new Logger(CompensatingOperationService.name);

    public async execute<T>(
        externalOperation: () => Promise<void>,
        compensatingOperation: () => Promise<void>,
        localWork: () => Promise<T>,
    ): Promise<T> {
        await externalOperation();
        try {
            return await localWork();
        } catch (error) {
            await this.tryCompensate(compensatingOperation, error);
            throw error;
        }
    }

    private async tryCompensate(operation: () => Promise<void>, originalError: unknown): Promise<void> {
        try {
            await operation();
        } catch (compensationError) {
            this.logger.error(
                "Compensation failed. The external operation was not reverted. " +
                    "This will be handled by the reconciliation job.",
                { originalError, compensationError },
            );
        }
    }
}

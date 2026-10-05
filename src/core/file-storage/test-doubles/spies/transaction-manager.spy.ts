import { type PrismaTransactionContext } from "@/prisma/index";
import { TransactionManager } from "@/shared/transaction";

export class TransactionManagerSpy extends TransactionManager {
    public shouldFail = false;
    public executeCalls = 0;
    public async execute<T>(operation: (context: PrismaTransactionContext) => Promise<T>): Promise<T> {
        this.executeCalls++;
        if (this.shouldFail) {
            throw new Error("Transaction failed");
        }
        return operation({} as PrismaTransactionContext);
    }
}

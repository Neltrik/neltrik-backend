import { type PrismaTransactionContext } from "@/prisma/index";
import { TransactionManager } from "@/shared/transaction";

export class TransactionManagerSpy extends TransactionManager {
    public execute: <T>(operation: (context: PrismaTransactionContext) => Promise<T>) => Promise<T> = jest.fn(
        async <T>(operation: (context: PrismaTransactionContext) => Promise<T>): Promise<T> => {
            return operation({} as PrismaTransactionContext);
        },
    );
}

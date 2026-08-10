import type { TransactionContext } from "../";

export abstract class TransactionManager {
    abstract execute<T>(operation: (context: TransactionContext) => Promise<T>): Promise<T>;
}

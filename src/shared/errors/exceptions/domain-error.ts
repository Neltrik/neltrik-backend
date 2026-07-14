import { BaseError } from "./base-error";

export abstract class DomainError extends BaseError {
    protected constructor(
        public readonly code: string,
        message: string,
    ) {
        super(message);
    }
}

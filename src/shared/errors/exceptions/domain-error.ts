import { BaseError } from "./base-error";

export abstract class DomainError extends BaseError {
    protected constructor(
        message: string,
        public readonly code: string,
    ) {
        super(message);
    }
}

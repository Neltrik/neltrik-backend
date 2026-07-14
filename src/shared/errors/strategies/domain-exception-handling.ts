import { type ErrorDetail } from "../contracts";
import { DomainError } from "../exceptions";
import { ExceptionHandlingStrategy } from "./exception-strategy";

export class DomainExceptionHandlingStrategy extends ExceptionHandlingStrategy {
    supports(error: unknown): boolean {
        return error instanceof DomainError;
    }

    handle(error: unknown): ErrorDetail[] {
        const domainError = error as DomainError;
        return [
            {
                code: domainError.code,
                message: domainError.message,
            },
        ];
    }
}

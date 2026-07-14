import type { ErrorDetail } from "../contracts";

export abstract class ExceptionHandlingStrategy {
    public abstract supports(error: unknown): boolean;
    public abstract handle(error: unknown): ErrorDetail[];
}

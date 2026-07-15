import { Injectable } from "@nestjs/common";

import { RESPONSE_CODES } from "@/shared/http";

import { ErrorDetail } from "../contracts";
import { DomainExceptionHandlingStrategy, ExceptionHandlingStrategy } from "../strategies";

@Injectable()
export class ExceptionResolver {
    private readonly strategies: ExceptionHandlingStrategy[];

    constructor(private readonly domainExceptionHandlingStrategy: DomainExceptionHandlingStrategy) {
        this.strategies = [this.domainExceptionHandlingStrategy];
    }

    public handle(exception: unknown): ErrorDetail[] {
        const strategy = this.strategies.find((strategy) => strategy.supports(exception));
        if (!strategy) {
            return [
                {
                    code: RESPONSE_CODES.INTERNAL_ERROR,
                    message: "An unexpected error occurred.",
                },
            ];
        }
        return strategy.handle(exception);
    }
}

import { Injectable } from "@nestjs/common";

import { RESPONSE_CODES } from "@/shared/http";

import { ErrorDetail } from "../../contracts";
import {
    DomainExceptionHandlingStrategy,
    ExceptionHandlingStrategy,
    NestJSExceptionHandlingStrategy,
    ZodExceptionHandlingStrategy,
} from "../../strategies";

@Injectable()
export class ExceptionResolver {
    private readonly strategies: ExceptionHandlingStrategy[];

    constructor(
        private readonly domainExceptionHandlingStrategy: DomainExceptionHandlingStrategy,
        private readonly nestJSExceptionHandlingStrategy: NestJSExceptionHandlingStrategy,
        private readonly zodExceptionHandlingStrategy: ZodExceptionHandlingStrategy,
    ) {
        this.strategies = [
            this.domainExceptionHandlingStrategy,
            this.nestJSExceptionHandlingStrategy,
            this.zodExceptionHandlingStrategy,
        ];
    }

    public handle(exception: unknown): ErrorDetail[] {
        const strategy = this.strategies.find((strategy) => strategy.supports(exception));
        if (!strategy) {
            return [{ code: RESPONSE_CODES.INTERNAL_ERROR, message: "An unexpected error occurred." }];
        }
        return strategy.handle(exception);
    }
}

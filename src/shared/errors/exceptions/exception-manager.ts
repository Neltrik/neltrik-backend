import { Injectable } from "@nestjs/common";

import { ErrorDetail } from "../contracts";
import { DomainExceptionHandlingStrategy, ExceptionHandlingStrategy } from "../strategies";

@Injectable()
export class ExceptionManager {
    private readonly strategies: ExceptionHandlingStrategy[];

    constructor(private readonly domainExceptionHandlingStrategy: DomainExceptionHandlingStrategy) {
        this.strategies = [this.domainExceptionHandlingStrategy];
    }

    public handle(exception: unknown): ErrorDetail[] {
        const strategy = this.strategies.find((strategy) => strategy.supports(exception));
        if (!strategy) {
            throw new Error("No exception handling strategy found.");
        }
        return strategy.handle(exception);
    }
}

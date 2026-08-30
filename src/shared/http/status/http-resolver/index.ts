import { HttpException, Injectable } from "@nestjs/common";

import { HttpStatusStrategy } from "../contracts";
import { DomainHttpStatusStrategy, ZodHttpStatusStrategy } from "../strategies";

@Injectable()
export class HttpStatusResolver {
    private readonly strategies: HttpStatusStrategy[];

    constructor(
        private readonly domainHttpStatusStrategy: DomainHttpStatusStrategy,
        private readonly zodHttpStatusStrategy: ZodHttpStatusStrategy,
    ) {
        this.strategies = [this.domainHttpStatusStrategy, this.zodHttpStatusStrategy];
    }

    public resolve(exception: unknown): number {
        if (exception instanceof HttpException) {
            return exception.getStatus();
        }
        const strategy = this.strategies.find((strategy) => strategy.supports(exception));
        if (!strategy) {
            return 500;
        }
        return strategy.resolve(exception);
    }
}

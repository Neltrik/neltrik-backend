import { Injectable } from "@nestjs/common";

import { HttpStatusStrategy } from "./contracts";
import { DomainHttpStatusStrategy } from "./strategies/domain-http-status-strategy";

@Injectable()
export class HttpStatusResolver {
    private readonly strategies: HttpStatusStrategy[];

    constructor(private readonly domainHttpStatusStrategy: DomainHttpStatusStrategy) {
        this.strategies = [this.domainHttpStatusStrategy];
    }

    public resolve(exception: unknown): number {
        const strategy = this.strategies.find((strategy) => strategy.supports(exception));
        if (!strategy) {
            return 500;
        }
        return strategy.resolve(exception);
    }
}

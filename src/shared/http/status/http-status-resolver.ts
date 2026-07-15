import { Injectable } from "@nestjs/common";

import { DomainHttpStatusStrategy } from "./domain-http-status-strategy";
import { HttpStatusStrategy } from "./http-status-strategy";

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

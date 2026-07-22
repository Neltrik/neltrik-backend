import { HttpStatus } from "@nestjs/common";

import { DomainHttpStatusStrategy } from "./";
import { HttpStatusResolver } from "./http-status-resolver";

describe("HttpStatusResolver", () => {
    const makeSut = () => {
        const domainHttpStatusStrategy = {
            supports: jest.fn(),
            resolve: jest.fn(),
        } satisfies Pick<DomainHttpStatusStrategy, "supports" | "resolve">;
        const resolver = new HttpStatusResolver(domainHttpStatusStrategy);
        return {
            resolver,
            domainHttpStatusStrategy,
        };
    };

    it("should resolve the status using the supported strategy", () => {
        const { resolver, domainHttpStatusStrategy } = makeSut();
        const exception = new Error();
        domainHttpStatusStrategy.supports.mockReturnValue(true);
        domainHttpStatusStrategy.resolve.mockReturnValue(404);
        const result = resolver.resolve(exception);
        expect(domainHttpStatusStrategy.supports).toHaveBeenCalledTimes(1);
        expect(domainHttpStatusStrategy.supports).toHaveBeenCalledWith(exception);
        expect(domainHttpStatusStrategy.resolve).toHaveBeenCalledTimes(1);
        expect(domainHttpStatusStrategy.resolve).toHaveBeenCalledWith(exception);
        expect(result).toBe(404);
    });

    it("should return 500 when no strategy supports the exception", () => {
        const { resolver, domainHttpStatusStrategy } = makeSut();
        const exception = new Error();
        domainHttpStatusStrategy.supports.mockReturnValue(false);
        const result = resolver.resolve(exception);
        expect(domainHttpStatusStrategy.supports).toHaveBeenCalledWith(exception);
        expect(domainHttpStatusStrategy.resolve).not.toHaveBeenCalled();
        expect(result).toBe(500);
    });
});

describe("DomainHttpStatusStrategy", () => {
    const makeSut = () => {
        return new DomainHttpStatusStrategy();
    };

    it("should not support non domain errors", () => {
        const strategy = makeSut();
        const exception = new Error("Unexpected error");
        const result = strategy.supports(exception);
        expect(result).toBe(false);
    });

    it("should resolve bad request status", () => {
        const strategy = makeSut();
        const result = strategy.resolve();
        expect(result).toBe(HttpStatus.BAD_REQUEST);
    });
});

import { HttpStatus } from "@nestjs/common";

import { DomainError } from "@/shared/errors";

import { DomainStatusRegistry } from "./domain-registry";
import { HttpStatusResolver } from "./http-resolver";
import { DomainHttpStatusStrategy } from "./strategies/domain-http-status-strategy";

class TestDomainError extends DomainError {
    public constructor() {
        super("TEST_DOMAIN_ERROR", "Test domain error");
    }
}

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
        domainHttpStatusStrategy.resolve.mockReturnValue(HttpStatus.NOT_FOUND);

        const result = resolver.resolve(exception);

        expect(domainHttpStatusStrategy.supports).toHaveBeenCalledTimes(1);
        expect(domainHttpStatusStrategy.supports).toHaveBeenCalledWith(exception);
        expect(domainHttpStatusStrategy.resolve).toHaveBeenCalledTimes(1);
        expect(domainHttpStatusStrategy.resolve).toHaveBeenCalledWith(exception);
        expect(result).toBe(HttpStatus.NOT_FOUND);
    });

    it("should return 500 when no strategy supports the exception", () => {
        const { resolver, domainHttpStatusStrategy } = makeSut();
        const exception = new Error();

        domainHttpStatusStrategy.supports.mockReturnValue(false);

        const result = resolver.resolve(exception);

        expect(domainHttpStatusStrategy.supports).toHaveBeenCalledWith(exception);
        expect(domainHttpStatusStrategy.resolve).not.toHaveBeenCalled();
        expect(result).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
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

    it("should return bad request when domain error has no registered status", () => {
        const strategy = makeSut();
        const exception = new TestDomainError();
        jest.spyOn(DomainStatusRegistry, "getStatus").mockReturnValue(undefined);
        const result = strategy.resolve(exception);
        expect(DomainStatusRegistry.getStatus).toHaveBeenCalledTimes(1);
        expect(DomainStatusRegistry.getStatus).toHaveBeenCalledWith(exception.code);
        expect(result).toBe(HttpStatus.BAD_REQUEST);
    });

    it("should return 500 when resolving a non domain error", () => {
        const strategy = makeSut();
        const exception = new Error("Unexpected error");
        const result = strategy.resolve(exception);
        expect(result).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it("should resolve the registered status for a domain error", () => {
        const strategy = makeSut();
        const exception = new TestDomainError();
        jest.spyOn(DomainStatusRegistry, "getStatus").mockReturnValue(HttpStatus.NOT_FOUND);
        const result = strategy.resolve(exception);
        expect(DomainStatusRegistry.getStatus).toHaveBeenCalledTimes(1);
        expect(DomainStatusRegistry.getStatus).toHaveBeenCalledWith(exception.code);
        expect(result).toBe(HttpStatus.NOT_FOUND);
    });

    it("should return bad request when domain error has no registered status", () => {
        const strategy = makeSut();
        const exception = new TestDomainError();
        jest.spyOn(DomainStatusRegistry, "getStatus").mockReturnValue(undefined);
        const result = strategy.resolve(exception);
        expect(DomainStatusRegistry.getStatus).toHaveBeenCalledTimes(1);
        expect(DomainStatusRegistry.getStatus).toHaveBeenCalledWith(exception.code);
        expect(result).toBe(HttpStatus.BAD_REQUEST);
    });
});

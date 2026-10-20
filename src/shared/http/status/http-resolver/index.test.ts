import { HttpException, HttpStatus } from "@nestjs/common";

import type { DomainHttpStatusStrategy } from "../strategies/domain-http";
import type { GlobalDomainHttpStatusStrategy } from "../strategies/global-domain-http";
import type { ZodHttpStatusStrategy } from "../strategies/zod-http";
import { HttpStatusResolver } from "./";

describe("HttpStatusResolver", () => {
    const makeSut = () => {
        const globalDomainHttpStatusStrategy = {
            supports: jest.fn(),
            resolve: jest.fn(),
        } satisfies Pick<GlobalDomainHttpStatusStrategy, "supports" | "resolve">;
        const domainHttpStatusStrategy = {
            supports: jest.fn(),
            resolve: jest.fn(),
        } satisfies Pick<DomainHttpStatusStrategy, "supports" | "resolve">;
        const zodHttpStatusStrategy = {
            supports: jest.fn(),
            resolve: jest.fn(),
        } satisfies Pick<ZodHttpStatusStrategy, "supports" | "resolve">;
        const resolver = new HttpStatusResolver(
            globalDomainHttpStatusStrategy,
            domainHttpStatusStrategy,
            zodHttpStatusStrategy,
        );
        return { resolver, globalDomainHttpStatusStrategy, domainHttpStatusStrategy, zodHttpStatusStrategy };
    };

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should return the status from an HttpException", () => {
        const { resolver, globalDomainHttpStatusStrategy, domainHttpStatusStrategy, zodHttpStatusStrategy } = makeSut();
        const exception = new HttpException("Not found", HttpStatus.NOT_FOUND);
        expect(resolver.resolve(exception)).toBe(HttpStatus.NOT_FOUND);
        expect(globalDomainHttpStatusStrategy.supports).not.toHaveBeenCalled();
        expect(domainHttpStatusStrategy.supports).not.toHaveBeenCalled();
        expect(zodHttpStatusStrategy.supports).not.toHaveBeenCalled();
    });

    it("should resolve using the global domain strategy first", () => {
        const { resolver, globalDomainHttpStatusStrategy, domainHttpStatusStrategy, zodHttpStatusStrategy } = makeSut();
        const exception = new Error("Domain error");
        globalDomainHttpStatusStrategy.supports.mockReturnValue(true);
        globalDomainHttpStatusStrategy.resolve.mockReturnValue(HttpStatus.CONFLICT);
        expect(resolver.resolve(exception)).toBe(HttpStatus.CONFLICT);
        expect(globalDomainHttpStatusStrategy.resolve).toHaveBeenCalledWith(exception);
        expect(domainHttpStatusStrategy.supports).not.toHaveBeenCalled();
        expect(zodHttpStatusStrategy.supports).not.toHaveBeenCalled();
    });

    it("should use the domain strategy when the global strategy does not support the exception", () => {
        const { resolver, globalDomainHttpStatusStrategy, domainHttpStatusStrategy, zodHttpStatusStrategy } = makeSut();
        const exception = new Error("Domain error");
        globalDomainHttpStatusStrategy.supports.mockReturnValue(false);
        domainHttpStatusStrategy.supports.mockReturnValue(true);
        domainHttpStatusStrategy.resolve.mockReturnValue(HttpStatus.NOT_FOUND);
        expect(resolver.resolve(exception)).toBe(HttpStatus.NOT_FOUND);
        expect(globalDomainHttpStatusStrategy.supports).toHaveBeenCalledWith(exception);
        expect(domainHttpStatusStrategy.supports).toHaveBeenCalledWith(exception);
        expect(domainHttpStatusStrategy.resolve).toHaveBeenCalledWith(exception);
        expect(zodHttpStatusStrategy.supports).not.toHaveBeenCalled();
    });

    it("should use the Zod strategy when the previous strategies do not support the exception", () => {
        const { resolver, globalDomainHttpStatusStrategy, domainHttpStatusStrategy, zodHttpStatusStrategy } = makeSut();
        const exception = new Error("Validation error");
        globalDomainHttpStatusStrategy.supports.mockReturnValue(false);
        domainHttpStatusStrategy.supports.mockReturnValue(false);
        zodHttpStatusStrategy.supports.mockReturnValue(true);
        zodHttpStatusStrategy.resolve.mockReturnValue(HttpStatus.BAD_REQUEST);
        expect(resolver.resolve(exception)).toBe(HttpStatus.BAD_REQUEST);
        expect(globalDomainHttpStatusStrategy.supports).toHaveBeenCalledWith(exception);
        expect(domainHttpStatusStrategy.supports).toHaveBeenCalledWith(exception);
        expect(zodHttpStatusStrategy.supports).toHaveBeenCalledWith(exception);
        expect(zodHttpStatusStrategy.resolve).toHaveBeenCalledWith(exception);
    });

    it("should return 500 when no strategy supports the exception", () => {
        const { resolver, globalDomainHttpStatusStrategy, domainHttpStatusStrategy, zodHttpStatusStrategy } = makeSut();
        const exception = new Error("Unexpected error");
        globalDomainHttpStatusStrategy.supports.mockReturnValue(false);
        domainHttpStatusStrategy.supports.mockReturnValue(false);
        zodHttpStatusStrategy.supports.mockReturnValue(false);
        expect(resolver.resolve(exception)).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(globalDomainHttpStatusStrategy.resolve).not.toHaveBeenCalled();
        expect(domainHttpStatusStrategy.resolve).not.toHaveBeenCalled();
        expect(zodHttpStatusStrategy.resolve).not.toHaveBeenCalled();
    });
});

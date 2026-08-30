import { HttpException, HttpStatus } from "@nestjs/common";

import type { DomainHttpStatusStrategy } from "../strategies/domain-http";
import type { ZodHttpStatusStrategy } from "../strategies/zod-http";
import { HttpStatusResolver } from "./";

describe("HttpStatusResolver", () => {
    const makeSut = () => {
        const domainHttpStatusStrategy = {
            supports: jest.fn(),
            resolve: jest.fn(),
        } satisfies Pick<DomainHttpStatusStrategy, "supports" | "resolve">;
        const zodHttpStatusStrategy = {
            supports: jest.fn(),
            resolve: jest.fn(),
        } satisfies Pick<ZodHttpStatusStrategy, "supports" | "resolve">;
        const resolver = new HttpStatusResolver(domainHttpStatusStrategy, zodHttpStatusStrategy);
        return { resolver, domainHttpStatusStrategy, zodHttpStatusStrategy };
    };

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should return the status from an HttpException", () => {
        const { resolver, domainHttpStatusStrategy, zodHttpStatusStrategy } = makeSut();
        const exception = new HttpException("Not found", HttpStatus.NOT_FOUND);
        const result = resolver.resolve(exception);
        expect(result).toBe(HttpStatus.NOT_FOUND);
        expect(domainHttpStatusStrategy.supports).not.toHaveBeenCalled();
        expect(zodHttpStatusStrategy.supports).not.toHaveBeenCalled();
        expect(domainHttpStatusStrategy.resolve).not.toHaveBeenCalled();
        expect(zodHttpStatusStrategy.resolve).not.toHaveBeenCalled();
    });

    it("should resolve the status using the first supported strategy", () => {
        const { resolver, domainHttpStatusStrategy, zodHttpStatusStrategy } = makeSut();
        const exception = new Error("Unexpected error");
        domainHttpStatusStrategy.supports.mockReturnValue(true);
        domainHttpStatusStrategy.resolve.mockReturnValue(HttpStatus.NOT_FOUND);
        const result = resolver.resolve(exception);
        expect(domainHttpStatusStrategy.supports).toHaveBeenCalledTimes(1);
        expect(domainHttpStatusStrategy.supports).toHaveBeenCalledWith(exception);
        expect(domainHttpStatusStrategy.resolve).toHaveBeenCalledTimes(1);
        expect(domainHttpStatusStrategy.resolve).toHaveBeenCalledWith(exception);
        expect(zodHttpStatusStrategy.supports).not.toHaveBeenCalled();
        expect(zodHttpStatusStrategy.resolve).not.toHaveBeenCalled();
        expect(result).toBe(HttpStatus.NOT_FOUND);
    });

    it("should use the zod strategy when the domain strategy does not support the exception", () => {
        const { resolver, domainHttpStatusStrategy, zodHttpStatusStrategy } = makeSut();
        const exception = new Error("Validation error");
        domainHttpStatusStrategy.supports.mockReturnValue(false);
        zodHttpStatusStrategy.supports.mockReturnValue(true);
        zodHttpStatusStrategy.resolve.mockReturnValue(HttpStatus.BAD_REQUEST);
        const result = resolver.resolve(exception);
        expect(domainHttpStatusStrategy.supports).toHaveBeenCalledTimes(1);
        expect(domainHttpStatusStrategy.supports).toHaveBeenCalledWith(exception);
        expect(zodHttpStatusStrategy.supports).toHaveBeenCalledTimes(1);
        expect(zodHttpStatusStrategy.supports).toHaveBeenCalledWith(exception);
        expect(zodHttpStatusStrategy.resolve).toHaveBeenCalledTimes(1);
        expect(zodHttpStatusStrategy.resolve).toHaveBeenCalledWith(exception);
        expect(result).toBe(HttpStatus.BAD_REQUEST);
    });

    it("should return 500 when no strategy supports the exception", () => {
        const { resolver, domainHttpStatusStrategy, zodHttpStatusStrategy } = makeSut();
        const exception = new Error("Unexpected error");
        domainHttpStatusStrategy.supports.mockReturnValue(false);
        zodHttpStatusStrategy.supports.mockReturnValue(false);
        const result = resolver.resolve(exception);
        expect(domainHttpStatusStrategy.supports).toHaveBeenCalledTimes(1);
        expect(domainHttpStatusStrategy.supports).toHaveBeenCalledWith(exception);
        expect(zodHttpStatusStrategy.supports).toHaveBeenCalledTimes(1);
        expect(zodHttpStatusStrategy.supports).toHaveBeenCalledWith(exception);
        expect(domainHttpStatusStrategy.resolve).not.toHaveBeenCalled();
        expect(zodHttpStatusStrategy.resolve).not.toHaveBeenCalled();
        expect(result).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
});

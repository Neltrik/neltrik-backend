import { HttpStatus } from "@nestjs/common";

import { ForbiddenError, UnauthorizedError } from "@/shared/errors";

import { GlobalDomainHttpStatusStrategy } from "./";

describe("GlobalDomainHttpStatusStrategy", () => {
    const makeSut = () => {
        return new GlobalDomainHttpStatusStrategy();
    };

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("supports", () => {
        it("should support forbidden errors", () => {
            const strategy = makeSut();
            const exception = new ForbiddenError();
            const result = strategy.supports(exception);
            expect(result).toBe(true);
        });

        it("should support unauthorized errors", () => {
            const strategy = makeSut();
            const exception = new UnauthorizedError();
            const result = strategy.supports(exception);
            expect(result).toBe(true);
        });

        it("should not support non global domain errors", () => {
            const strategy = makeSut();
            const exception = new Error("Unexpected error");
            const result = strategy.supports(exception);
            expect(result).toBe(false);
        });

        it("should not support unknown exceptions", () => {
            const strategy = makeSut();
            const result = strategy.supports("Unexpected error");
            expect(result).toBe(false);
        });
    });

    describe("resolve", () => {
        it("should return forbidden when exception is a ForbiddenError", () => {
            const strategy = makeSut();
            const exception = new ForbiddenError();
            const result = strategy.resolve(exception);
            expect(result).toBe(HttpStatus.FORBIDDEN);
        });

        it("should return unauthorized when exception is an UnauthorizedError", () => {
            const strategy = makeSut();
            const exception = new UnauthorizedError();
            const result = strategy.resolve(exception);
            expect(result).toBe(HttpStatus.UNAUTHORIZED);
        });

        it("should return bad request when exception is not a supported error", () => {
            const strategy = makeSut();
            const exception = new Error("Unexpected error");
            const result = strategy.resolve(exception);
            expect(result).toBe(HttpStatus.BAD_REQUEST);
        });

        it("should return bad request when exception is unknown", () => {
            const strategy = makeSut();
            const result = strategy.resolve(null);
            expect(result).toBe(HttpStatus.BAD_REQUEST);
        });
    });
});

import { HttpStatus } from "@nestjs/common";

import { DomainError } from "@/shared/errors";

import { DomainStatusRegistry } from "../../domain-registry";
import { DomainHttpStatusStrategy } from "./";

class TestDomainError extends DomainError {
    public constructor() {
        super("TEST_DOMAIN_ERROR", "Test domain error");
    }
}

describe("DomainHttpStatusStrategy", () => {
    const makeSut = () => {
        return new DomainHttpStatusStrategy();
    };

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("supports", () => {
        it("should support domain errors", () => {
            const strategy = makeSut();
            const exception = new TestDomainError();
            const result = strategy.supports(exception);
            expect(result).toBe(true);
        });

        it("should not support non domain errors", () => {
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
        it("should return internal server error when exception is not a domain error", () => {
            const strategy = makeSut();
            const exception = new Error("Unexpected error");
            const result = strategy.resolve(exception);
            expect(result).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        });

        it("should return internal server error when exception is unknown", () => {
            const strategy = makeSut();
            const result = strategy.resolve(null);
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

        it("should not resolve the status when exception is not a domain error", () => {
            const strategy = makeSut();
            const exception = new Error("Unexpected error");
            const getStatusSpy = jest.spyOn(DomainStatusRegistry, "getStatus");
            const result = strategy.resolve(exception);
            expect(getStatusSpy).not.toHaveBeenCalled();
            expect(result).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        });
    });
});

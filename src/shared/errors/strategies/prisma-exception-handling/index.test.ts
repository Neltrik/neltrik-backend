import { Prisma } from "@prisma/client";

import { RESPONSE_CODES } from "@/shared/http";

import { PrismaExceptionHandlingStrategy } from "./";

describe("PrismaExceptionHandlingStrategy", () => {
    const makeSut = () => {
        const strategy = new PrismaExceptionHandlingStrategy();
        return { strategy };
    };

    const makePrismaError = (code: string): Prisma.PrismaClientKnownRequestError =>
        new Prisma.PrismaClientKnownRequestError("Test Prisma error", { code, clientVersion: "test" });

    describe("supports", () => {
        it("should return true when the error is a PrismaClientKnownRequestError", () => {
            const { strategy } = makeSut();
            const error = makePrismaError("P2002");
            expect(strategy.supports(error)).toBe(true);
        });

        it("should return false when the error is a regular Error", () => {
            const { strategy } = makeSut();
            const error = new Error("Test error");
            expect(strategy.supports(error)).toBe(false);
        });

        it("should return false when the error is not an Error instance", () => {
            const { strategy } = makeSut();
            expect(strategy.supports({ code: "P2002" })).toBe(false);
            expect(strategy.supports(null)).toBe(false);
            expect(strategy.supports(undefined)).toBe(false);
        });
    });

    describe("handle", () => {
        it("should return a conflict error for P2002", () => {
            const { strategy } = makeSut();
            const error = makePrismaError("P2002");
            expect(strategy.handle(error)).toEqual([
                { code: RESPONSE_CODES.CONFLICT, message: "A record with the same unique fields already exists." },
            ]);
        });

        it("should return a not found error for P2025", () => {
            const { strategy } = makeSut();
            const error = makePrismaError("P2025");
            expect(strategy.handle(error)).toEqual([{ code: RESPONSE_CODES.NOT_FOUND, message: "Record not found." }]);
        });

        it.each(["P2003", "P2014"])("should return a bad request error for %s", (code) => {
            const { strategy } = makeSut();
            const error = makePrismaError(code);
            expect(strategy.handle(error)).toEqual([
                { code: RESPONSE_CODES.BAD_REQUEST, message: "Invalid reference." },
            ]);
        });

        it("should return an internal error for an unsupported Prisma error code", () => {
            const { strategy } = makeSut();
            const error = makePrismaError("P9999");
            expect(strategy.handle(error)).toEqual([
                { code: RESPONSE_CODES.INTERNAL_ERROR, message: "An unexpected database error occurred." },
            ]);
        });

        it("should return an internal error when the error is not a PrismaClientKnownRequestError", () => {
            const { strategy } = makeSut();
            const error = new Error("Unexpected error");
            expect(strategy.handle(error)).toEqual([
                { code: RESPONSE_CODES.INTERNAL_ERROR, message: "An unexpected error occurred." },
            ]);
        });

        it("should return an internal error when the error is null", () => {
            const { strategy } = makeSut();
            expect(strategy.handle(null)).toEqual([
                { code: RESPONSE_CODES.INTERNAL_ERROR, message: "An unexpected error occurred." },
            ]);
        });
    });
});

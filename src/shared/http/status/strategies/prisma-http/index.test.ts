import { HttpStatus } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaHttpStatusStrategy } from "./";

describe("PrismaHttpStatusStrategy", () => {
    const makeSut = () => {
        const strategy = new PrismaHttpStatusStrategy();
        return { strategy };
    };

    const makePrismaError = (code: string): Prisma.PrismaClientKnownRequestError =>
        new Prisma.PrismaClientKnownRequestError("Test Prisma error", { code, clientVersion: "test" });

    describe("supports", () => {
        it("should return true when the exception is a PrismaClientKnownRequestError", () => {
            const { strategy } = makeSut();
            const exception = makePrismaError("P2002");
            expect(strategy.supports(exception)).toBe(true);
        });

        it("should return false when the exception is a regular Error", () => {
            const { strategy } = makeSut();
            const exception = new Error("Test error");
            expect(strategy.supports(exception)).toBe(false);
        });

        it("should return false when the exception is not an Error instance", () => {
            const { strategy } = makeSut();
            expect(strategy.supports({ code: "P2002" })).toBe(false);
            expect(strategy.supports(null)).toBe(false);
            expect(strategy.supports(undefined)).toBe(false);
        });
    });

    describe("resolve", () => {
        it("should return CONFLICT for P2002", () => {
            const { strategy } = makeSut();
            const exception = makePrismaError("P2002");
            expect(strategy.resolve(exception)).toBe(HttpStatus.CONFLICT);
        });

        it("should return NOT_FOUND for P2025", () => {
            const { strategy } = makeSut();
            const exception = makePrismaError("P2025");
            expect(strategy.resolve(exception)).toBe(HttpStatus.NOT_FOUND);
        });

        it.each(["P2003", "P2014"])("should return BAD_REQUEST for %s", (code) => {
            const { strategy } = makeSut();
            const exception = makePrismaError(code);
            expect(strategy.resolve(exception)).toBe(HttpStatus.BAD_REQUEST);
        });

        it("should return INTERNAL_SERVER_ERROR for an unknown Prisma error code", () => {
            const { strategy } = makeSut();
            const exception = makePrismaError("P9999");
            expect(strategy.resolve(exception)).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        });

        it("should return INTERNAL_SERVER_ERROR when the exception is not a PrismaClientKnownRequestError", () => {
            const { strategy } = makeSut();
            const exception = new Error("Unexpected error");
            expect(strategy.resolve(exception)).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        });

        it("should return INTERNAL_SERVER_ERROR when the exception is null", () => {
            const { strategy } = makeSut();
            expect(strategy.resolve(null)).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        });
    });
});

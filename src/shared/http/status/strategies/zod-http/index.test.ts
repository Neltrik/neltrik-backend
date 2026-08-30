import { HttpStatus } from "@nestjs/common";
import { z } from "zod";

import { ZodValidationException } from "@/shared/zod";

import { ZodHttpStatusStrategy } from "./";

describe("ZodHttpStatusStrategy", () => {
    const makeSut = () => {
        return new ZodHttpStatusStrategy();
    };

    const makeZodValidationException = () => {
        const schema = z.object({ name: z.string() });
        const result = schema.safeParse({ name: 123 });
        if (result.success) {
            throw new Error("Expected validation to fail");
        }
        return new ZodValidationException(result.error);
    };

    describe("supports", () => {
        it("should support zod validation exceptions", () => {
            const strategy = makeSut();
            const exception = makeZodValidationException();
            const result = strategy.supports(exception);
            expect(result).toBe(true);
        });

        it("should not support non zod validation exceptions", () => {
            const strategy = makeSut();
            const exception = new Error("Unexpected error");
            const result = strategy.supports(exception);
            expect(result).toBe(false);
        });

        it("should not support unknown exceptions", () => {
            const strategy = makeSut();
            const result = strategy.supports(null);
            expect(result).toBe(false);
        });
    });

    describe("resolve", () => {
        it("should return bad request", () => {
            const strategy = makeSut();
            const result = strategy.resolve();
            expect(result).toBe(HttpStatus.BAD_REQUEST);
        });
    });
});

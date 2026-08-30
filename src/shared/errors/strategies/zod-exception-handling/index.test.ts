import { z } from "zod";

import { RESPONSE_CODES } from "@/shared/http";
import { ZodValidationException } from "@/shared/zod";

import { ZodExceptionHandlingStrategy } from "./index";

describe("ZodExceptionHandlingStrategy", () => {
    const makeSut = () => {
        return new ZodExceptionHandlingStrategy();
    };

    describe("supports", () => {
        it("should support Zod validation exceptions", () => {
            const strategy = makeSut();
            const zodError = z.object({ name: z.string() }).safeParse({ name: 123 }).error!;
            const error = new ZodValidationException(zodError);
            const result = strategy.supports(error);
            expect(result).toBe(true);
        });

        it("should not support non Zod validation exceptions", () => {
            const strategy = makeSut();
            const error = new Error("Unexpected error");
            const result = strategy.supports(error);
            expect(result).toBe(false);
        });
    });

    describe("handle", () => {
        it("should return internal error when the exception is not a Zod validation exception", () => {
            const strategy = makeSut();
            const error = new Error("Unexpected error");
            const result = strategy.handle(error);
            expect(result).toEqual([{ code: "INTERNAL_ERROR", message: "An unexpected error occurred." }]);
        });

        it("should return validation details from Zod issues", () => {
            const strategy = makeSut();
            const schema = z.object({ user: z.object({ email: z.email() }), name: z.string() });
            const zodError = schema.safeParse({ user: { email: "invalid-email" }, name: 123 }).error!;
            const error = new ZodValidationException(zodError);
            const result = strategy.handle(error);
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                code: RESPONSE_CODES.VALIDATION_ERROR,
                message: zodError.issues[0]!.message,
                field: "user.email",
            });
            expect(result[1]).toEqual({
                code: RESPONSE_CODES.VALIDATION_ERROR,
                message: zodError.issues[1]!.message,
                field: "name",
            });
        });

        it("should return the validation message and field path", () => {
            const strategy = makeSut();
            const schema = z.object({
                user: z.object({ email: z.email() }),
            });
            const zodError = schema.safeParse({
                user: { email: "invalid-email" },
            }).error!;
            const error = new ZodValidationException(zodError);
            const result = strategy.handle(error);
            expect(result).toEqual([
                { code: RESPONSE_CODES.VALIDATION_ERROR, message: zodError.issues[0]!.message, field: "user.email" },
            ]);
        });

        it("should return an empty field when the issue has no path", () => {
            const strategy = makeSut();
            const schema = z
                .object({
                    name: z.string(),
                })
                .superRefine((_, ctx) => {
                    ctx.addIssue({ code: "custom", message: "Invalid object", path: [] });
                });
            const zodError = schema.safeParse({ name: "John" }).error!;
            const error = new ZodValidationException(zodError);
            const result = strategy.handle(error);
            expect(result).toEqual([{ code: RESPONSE_CODES.VALIDATION_ERROR, message: "Invalid object", field: "" }]);
        });
    });
});

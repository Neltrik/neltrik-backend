import { BadRequestException, HttpException, HttpStatus } from "@nestjs/common";

import { RESPONSE_CODES } from "@/shared/http";

import { NestJSExceptionHandlingStrategy } from "./index";

describe("NestJSExceptionHandlingStrategy", () => {
    const makeSut = () => {
        return new NestJSExceptionHandlingStrategy();
    };

    describe("supports", () => {
        it("should support HttpException", () => {
            const strategy = makeSut();
            const exception = new BadRequestException("Invalid request");
            const result = strategy.supports(exception);
            expect(result).toBe(true);
        });

        it("should return internal error when HttpException response is not a string or object", () => {
            const strategy = makeSut();
            const exception = new HttpException("Unexpected error", HttpStatus.BAD_REQUEST);
            Object.defineProperty(exception, "getResponse", { value: () => 500 });
            const result = strategy.handle(exception);
            expect(result).toEqual([{ code: RESPONSE_CODES.INTERNAL_ERROR, message: "An unexpected error occurred." }]);
        });

        it("should not support non HttpException errors", () => {
            const strategy = makeSut();
            const exception = new Error("Unexpected error");
            const result = strategy.supports(exception);
            expect(result).toBe(false);
        });
    });

    describe("handle", () => {
        it("should return internal error when the error is not an HttpException", () => {
            const strategy = makeSut();
            const exception = new Error("Unexpected error");
            const result = strategy.handle(exception);
            expect(result).toEqual([{ code: RESPONSE_CODES.INTERNAL_ERROR, message: "An unexpected error occurred." }]);
        });

        it("should return the exception response when response is a string", () => {
            const strategy = makeSut();
            const exception = new HttpException("Invalid request", HttpStatus.BAD_REQUEST);
            const result = strategy.handle(exception);
            expect(result).toEqual([{ code: exception.name.toUpperCase(), message: "Invalid request" }]);
        });

        it("should return the message when response contains a message string", () => {
            const strategy = makeSut();
            const exception = new HttpException({ message: "Invalid request" }, HttpStatus.BAD_REQUEST);
            const result = strategy.handle(exception);
            expect(result).toEqual([{ code: exception.name.toUpperCase(), message: "Invalid request" }]);
        });

        it("should join message array values", () => {
            const strategy = makeSut();
            const exception = new HttpException(
                { message: ["Invalid email", "Invalid password"] },
                HttpStatus.BAD_REQUEST,
            );
            const result = strategy.handle(exception);
            expect(result).toEqual([
                { code: exception.name.toUpperCase(), message: "Invalid email, Invalid password" },
            ]);
        });

        it("should return the error property when response contains an error string", () => {
            const strategy = makeSut();
            const exception = new HttpException({ error: "Bad Request" }, HttpStatus.BAD_REQUEST);
            const result = strategy.handle(exception);
            expect(result).toEqual([{ code: exception.name.toUpperCase(), message: "Bad Request" }]);
        });

        it("should return internal error when response does not contain a valid message", () => {
            const strategy = makeSut();
            const exception = new HttpException({ statusCode: HttpStatus.BAD_REQUEST }, HttpStatus.BAD_REQUEST);
            const result = strategy.handle(exception);
            expect(result).toEqual([{ code: exception.name.toUpperCase(), message: "An unexpected error occurred." }]);
        });
    });
});

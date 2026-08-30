import { type ArgumentsHost, HttpStatus } from "@nestjs/common";
import type { Response } from "express";

import { HttpStatusResolver, ResponseBuilder } from "@/shared/http";

import { ExceptionResolver } from "../exceptions";
import { GlobalExceptionFilter } from "./";

describe("GlobalExceptionFilter", () => {
    const makeSut = () => {
        const exceptionResolver = Object.create(ExceptionResolver.prototype) as ExceptionResolver;
        const httpStatusResolver = Object.create(HttpStatusResolver.prototype) as HttpStatusResolver;
        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } satisfies Pick<Response, "status" | "json">;
        const host = {
            getArgs: jest.fn(),
            getArgByIndex: jest.fn(),
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn(),
                getResponse: jest.fn().mockReturnValue(response),
                getNext: jest.fn(),
            }),
            switchToRpc: jest.fn(),
            switchToWs: jest.fn(),
            getType: jest.fn(),
        } satisfies ArgumentsHost;
        const filter = new GlobalExceptionFilter(exceptionResolver, httpStatusResolver);
        return { filter, exceptionResolver, httpStatusResolver, response, host };
    };

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should handle the exception and send the response", () => {
        const { filter, exceptionResolver, httpStatusResolver, response, host } = makeSut();
        const exception = new Error("Test error");
        const details = [{ code: "TEST_ERROR", message: "Test error" }];
        const builtResponse = {
            data: null,
            code: "TEST_ERROR",
            message: "Test error",
            error: { code: "TEST_ERROR", message: "Test error" },
            details,
            meta: {},
        };
        jest.spyOn(exceptionResolver, "handle").mockReturnValue(details);
        jest.spyOn(httpStatusResolver, "resolve").mockReturnValue(HttpStatus.BAD_REQUEST);
        jest.spyOn(ResponseBuilder, "build").mockReturnValue(builtResponse);
        filter.catch(exception, host);
        expect(exceptionResolver.handle).toHaveBeenCalledWith(exception);
        expect(httpStatusResolver.resolve).toHaveBeenCalledWith(exception);
        expect(ResponseBuilder.build).toHaveBeenCalledWith(null, "TEST_ERROR", "Test error", details);
        expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
        expect(response.json).toHaveBeenCalledWith(builtResponse);
    });
});

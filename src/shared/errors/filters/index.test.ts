import type { ArgumentsHost } from "@nestjs/common";

import { RESPONSE_CODES } from "@/shared/http";
import { DomainHttpStatusStrategy, HttpStatusResolver } from "@/shared/http";

import { ExceptionResolver } from "../exceptions";
import { type DomainExceptionHandlingStrategy } from "../strategies";
import { GlobalExceptionFilter } from "./";

describe("GlobalExceptionFilter", () => {
    const makeSut = () => {
        const domainExceptionHandlingStrategy = {
            supports: jest.fn(),
            handle: jest.fn(),
        } as unknown as DomainExceptionHandlingStrategy;
        const exceptionResolver = new ExceptionResolver(domainExceptionHandlingStrategy);
        const domainHttpStatusStrategy = new DomainHttpStatusStrategy();
        const httpStatusResolver = new HttpStatusResolver(domainHttpStatusStrategy);
        const filter = new GlobalExceptionFilter(exceptionResolver, httpStatusResolver);
        return {
            filter,
            exceptionResolver,
            httpStatusResolver,
        };
    };

    it("should return the formatted error response", () => {
        const { filter, exceptionResolver, httpStatusResolver } = makeSut();
        const json = jest.fn();
        const status = jest.fn().mockReturnValue({
            json,
        });
        const response = {
            status,
        } as unknown as Response;
        const host = {
            switchToHttp: jest.fn().mockReturnValue({
                getResponse: jest.fn().mockReturnValue(response),
            }),
        } as unknown as ArgumentsHost;
        const exception = new Error();
        jest.spyOn(exceptionResolver, "handle").mockReturnValue([
            {
                code: RESPONSE_CODES.INTERNAL_ERROR,
                message: "Unexpected error.",
            },
        ]);
        jest.spyOn(httpStatusResolver, "resolve").mockReturnValue(500);
        filter.catch(exception, host);
        expect(exceptionResolver.handle).toHaveBeenCalledWith(exception);
        expect(httpStatusResolver.resolve).toHaveBeenCalledWith(exception);
        expect(status).toHaveBeenCalledWith(500);
        expect(json).toHaveBeenCalledWith({
            data: null,
            code: RESPONSE_CODES.INTERNAL_ERROR,
            message: "Unexpected error.",
            details: [],
            meta: {},
        });
    });
});

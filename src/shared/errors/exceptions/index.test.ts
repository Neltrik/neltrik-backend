import { RESPONSE_CODES } from "@/shared/http";

import { type DomainExceptionHandlingStrategy } from "../strategies";
import { ExceptionResolver } from "./exception-resolver";

describe("ExceptionResolver", () => {
    const makeSut = () => {
        const domainExceptionHandlingStrategy = {
            supports: jest.fn(),
            handle: jest.fn(),
        } satisfies Pick<DomainExceptionHandlingStrategy, "supports" | "handle">;
        const resolver = new ExceptionResolver(domainExceptionHandlingStrategy);
        return {
            resolver,
            domainExceptionHandlingStrategy,
        };
    };

    it("should handle the exception using the supported strategy", () => {
        const { resolver, domainExceptionHandlingStrategy } = makeSut();
        const exception = new Error();
        const expected = [
            {
                code: "DOMAIN_ERROR",
                message: "Invalid title.",
            },
        ];
        domainExceptionHandlingStrategy.supports.mockReturnValue(true);
        domainExceptionHandlingStrategy.handle.mockReturnValue(expected);
        const result = resolver.handle(exception);
        expect(domainExceptionHandlingStrategy.supports).toHaveBeenCalledTimes(1);
        expect(domainExceptionHandlingStrategy.supports).toHaveBeenCalledWith(exception);
        expect(domainExceptionHandlingStrategy.handle).toHaveBeenCalledTimes(1);
        expect(domainExceptionHandlingStrategy.handle).toHaveBeenCalledWith(exception);
        expect(result).toEqual(expected);
    });

    it("should return an internal error when no strategy supports the exception", () => {
        const { resolver, domainExceptionHandlingStrategy } = makeSut();
        const exception = new Error();
        domainExceptionHandlingStrategy.supports.mockReturnValue(false);
        const result = resolver.handle(exception);
        expect(domainExceptionHandlingStrategy.supports).toHaveBeenCalledWith(exception);
        expect(domainExceptionHandlingStrategy.handle).not.toHaveBeenCalled();
        expect(result).toEqual([
            {
                code: RESPONSE_CODES.INTERNAL_ERROR,
                message: "An unexpected error occurred.",
            },
        ]);
    });
});

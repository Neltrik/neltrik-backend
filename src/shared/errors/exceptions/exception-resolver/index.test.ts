import { RESPONSE_CODES } from "@/shared/http";

import {
    DomainExceptionHandlingStrategy,
    NestJSExceptionHandlingStrategy,
    ZodExceptionHandlingStrategy,
} from "../../strategies";
import { ExceptionResolver } from "./";

describe("ExceptionResolver", () => {
    const makeSut = () => {
        const domainExceptionHandlingStrategy = new DomainExceptionHandlingStrategy();
        const nestJSExceptionHandlingStrategy = new NestJSExceptionHandlingStrategy();
        const zodExceptionHandlingStrategy = new ZodExceptionHandlingStrategy();
        const resolver = new ExceptionResolver(
            domainExceptionHandlingStrategy,
            nestJSExceptionHandlingStrategy,
            zodExceptionHandlingStrategy,
        );
        return {
            resolver,
            domainExceptionHandlingStrategy,
            nestJSExceptionHandlingStrategy,
            zodExceptionHandlingStrategy,
        };
    };

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should return the details from the supported strategy", () => {
        const {
            resolver,
            domainExceptionHandlingStrategy,
            nestJSExceptionHandlingStrategy,
            zodExceptionHandlingStrategy,
        } = makeSut();
        const exception = new Error("Test error");
        const details = [{ code: "DOMAIN_ERROR", message: "Domain error" }];
        jest.spyOn(domainExceptionHandlingStrategy, "supports").mockReturnValue(true);
        jest.spyOn(domainExceptionHandlingStrategy, "handle").mockReturnValue(details);
        const nestSupportsSpy = jest.spyOn(nestJSExceptionHandlingStrategy, "supports");
        const zodSupportsSpy = jest.spyOn(zodExceptionHandlingStrategy, "supports");
        const result = resolver.handle(exception);
        expect(domainExceptionHandlingStrategy.supports).toHaveBeenCalledWith(exception);
        expect(domainExceptionHandlingStrategy.handle).toHaveBeenCalledWith(exception);
        expect(nestSupportsSpy).not.toHaveBeenCalled();
        expect(zodSupportsSpy).not.toHaveBeenCalled();
        expect(result).toEqual(details);
    });

    it("should use the next strategy when the first strategy does not support the exception", () => {
        const {
            resolver,
            domainExceptionHandlingStrategy,
            nestJSExceptionHandlingStrategy,
            zodExceptionHandlingStrategy,
        } = makeSut();
        const exception = new Error("Test error");
        const details = [{ code: "NESTJS_ERROR", message: "NestJS error" }];
        jest.spyOn(domainExceptionHandlingStrategy, "supports").mockReturnValue(false);
        jest.spyOn(nestJSExceptionHandlingStrategy, "supports").mockReturnValue(true);
        jest.spyOn(nestJSExceptionHandlingStrategy, "handle").mockReturnValue(details);
        const zodSupportsSpy = jest.spyOn(zodExceptionHandlingStrategy, "supports");
        const result = resolver.handle(exception);
        expect(domainExceptionHandlingStrategy.supports).toHaveBeenCalledWith(exception);
        expect(nestJSExceptionHandlingStrategy.supports).toHaveBeenCalledWith(exception);
        expect(nestJSExceptionHandlingStrategy.handle).toHaveBeenCalledWith(exception);
        expect(zodSupportsSpy).not.toHaveBeenCalled();
        expect(result).toEqual(details);
    });

    it("should use the zod strategy when previous strategies do not support the exception", () => {
        const {
            resolver,
            domainExceptionHandlingStrategy,
            nestJSExceptionHandlingStrategy,
            zodExceptionHandlingStrategy,
        } = makeSut();
        const exception = new Error("Test error");
        const details = [{ code: "VALIDATION_ERROR", message: "Validation error" }];
        jest.spyOn(domainExceptionHandlingStrategy, "supports").mockReturnValue(false);
        jest.spyOn(nestJSExceptionHandlingStrategy, "supports").mockReturnValue(false);
        jest.spyOn(zodExceptionHandlingStrategy, "supports").mockReturnValue(true);
        jest.spyOn(zodExceptionHandlingStrategy, "handle").mockReturnValue(details);
        const result = resolver.handle(exception);
        expect(domainExceptionHandlingStrategy.supports).toHaveBeenCalledWith(exception);
        expect(nestJSExceptionHandlingStrategy.supports).toHaveBeenCalledWith(exception);
        expect(zodExceptionHandlingStrategy.supports).toHaveBeenCalledWith(exception);
        expect(zodExceptionHandlingStrategy.handle).toHaveBeenCalledWith(exception);
        expect(result).toEqual(details);
    });

    it("should return an internal error when no strategy supports the exception", () => {
        const {
            resolver,
            domainExceptionHandlingStrategy,
            nestJSExceptionHandlingStrategy,
            zodExceptionHandlingStrategy,
        } = makeSut();
        const exception = new Error("Unexpected error");
        jest.spyOn(domainExceptionHandlingStrategy, "supports").mockReturnValue(false);
        jest.spyOn(nestJSExceptionHandlingStrategy, "supports").mockReturnValue(false);
        jest.spyOn(zodExceptionHandlingStrategy, "supports").mockReturnValue(false);
        jest.spyOn(domainExceptionHandlingStrategy, "handle");
        jest.spyOn(nestJSExceptionHandlingStrategy, "handle");
        jest.spyOn(zodExceptionHandlingStrategy, "handle");
        const result = resolver.handle(exception);
        expect(domainExceptionHandlingStrategy.supports).toHaveBeenCalledWith(exception);
        expect(nestJSExceptionHandlingStrategy.supports).toHaveBeenCalledWith(exception);
        expect(zodExceptionHandlingStrategy.supports).toHaveBeenCalledWith(exception);
        expect(domainExceptionHandlingStrategy.handle).not.toHaveBeenCalled();
        expect(nestJSExceptionHandlingStrategy.handle).not.toHaveBeenCalled();
        expect(zodExceptionHandlingStrategy.handle).not.toHaveBeenCalled();
        expect(result).toEqual([{ code: RESPONSE_CODES.INTERNAL_ERROR, message: "An unexpected error occurred." }]);
    });
});

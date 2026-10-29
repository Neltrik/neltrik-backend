import { RESPONSE_CODES } from "@/shared/http";

import {
    DomainExceptionHandlingStrategy,
    NestJSExceptionHandlingStrategy,
    PrismaExceptionHandlingStrategy,
    ZodExceptionHandlingStrategy,
} from "../../strategies";
import { ExceptionResolver } from "./";

describe("ExceptionResolver", () => {
    const makeSut = () => {
        const domainExceptionHandlingStrategy = new DomainExceptionHandlingStrategy();
        const prismaExceptionHandlingStrategy = new PrismaExceptionHandlingStrategy();
        const zodExceptionHandlingStrategy = new ZodExceptionHandlingStrategy();
        const nestJSExceptionHandlingStrategy = new NestJSExceptionHandlingStrategy();
        const resolver = new ExceptionResolver(
            domainExceptionHandlingStrategy,
            nestJSExceptionHandlingStrategy,
            prismaExceptionHandlingStrategy,
            zodExceptionHandlingStrategy,
        );
        return {
            resolver,
            domainExceptionHandlingStrategy,
            prismaExceptionHandlingStrategy,
            zodExceptionHandlingStrategy,
            nestJSExceptionHandlingStrategy,
        };
    };

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should return the details from the first supported strategy", () => {
        const {
            resolver,
            domainExceptionHandlingStrategy,
            prismaExceptionHandlingStrategy,
            zodExceptionHandlingStrategy,
            nestJSExceptionHandlingStrategy,
        } = makeSut();
        const exception = new Error("Test error");
        const details = [{ code: "DOMAIN_ERROR", message: "Domain error" }];
        jest.spyOn(domainExceptionHandlingStrategy, "supports").mockReturnValue(true);
        jest.spyOn(domainExceptionHandlingStrategy, "handle").mockReturnValue(details);
        const prismaSupportsSpy = jest.spyOn(prismaExceptionHandlingStrategy, "supports");
        const zodSupportsSpy = jest.spyOn(zodExceptionHandlingStrategy, "supports");
        const nestSupportsSpy = jest.spyOn(nestJSExceptionHandlingStrategy, "supports");
        const result = resolver.handle(exception);
        expect(domainExceptionHandlingStrategy.supports).toHaveBeenCalledWith(exception);
        expect(domainExceptionHandlingStrategy.handle).toHaveBeenCalledWith(exception);
        expect(prismaSupportsSpy).not.toHaveBeenCalled();
        expect(zodSupportsSpy).not.toHaveBeenCalled();
        expect(nestSupportsSpy).not.toHaveBeenCalled();
        expect(result).toEqual(details);
    });

    it("should use the Prisma strategy when the domain strategy does not support the exception", () => {
        const {
            resolver,
            domainExceptionHandlingStrategy,
            prismaExceptionHandlingStrategy,
            zodExceptionHandlingStrategy,
            nestJSExceptionHandlingStrategy,
        } = makeSut();
        const exception = new Error("Prisma error");
        const details = [{ code: "PRISMA_ERROR", message: "Prisma error" }];
        jest.spyOn(domainExceptionHandlingStrategy, "supports").mockReturnValue(false);
        jest.spyOn(prismaExceptionHandlingStrategy, "supports").mockReturnValue(true);
        jest.spyOn(prismaExceptionHandlingStrategy, "handle").mockReturnValue(details);
        const zodSupportsSpy = jest.spyOn(zodExceptionHandlingStrategy, "supports");
        const nestSupportsSpy = jest.spyOn(nestJSExceptionHandlingStrategy, "supports");
        const result = resolver.handle(exception);
        expect(domainExceptionHandlingStrategy.supports).toHaveBeenCalledWith(exception);
        expect(prismaExceptionHandlingStrategy.supports).toHaveBeenCalledWith(exception);
        expect(prismaExceptionHandlingStrategy.handle).toHaveBeenCalledWith(exception);
        expect(zodSupportsSpy).not.toHaveBeenCalled();
        expect(nestSupportsSpy).not.toHaveBeenCalled();
        expect(result).toEqual(details);
    });

    it("should use the Zod strategy when the domain and Prisma strategies do not support the exception", () => {
        const {
            resolver,
            domainExceptionHandlingStrategy,
            prismaExceptionHandlingStrategy,
            zodExceptionHandlingStrategy,
            nestJSExceptionHandlingStrategy,
        } = makeSut();
        const exception = new Error("Validation error");
        const details = [{ code: "VALIDATION_ERROR", message: "Validation error" }];
        jest.spyOn(domainExceptionHandlingStrategy, "supports").mockReturnValue(false);
        jest.spyOn(prismaExceptionHandlingStrategy, "supports").mockReturnValue(false);
        jest.spyOn(zodExceptionHandlingStrategy, "supports").mockReturnValue(true);
        jest.spyOn(zodExceptionHandlingStrategy, "handle").mockReturnValue(details);
        const nestSupportsSpy = jest.spyOn(nestJSExceptionHandlingStrategy, "supports");
        const result = resolver.handle(exception);
        expect(domainExceptionHandlingStrategy.supports).toHaveBeenCalledWith(exception);
        expect(prismaExceptionHandlingStrategy.supports).toHaveBeenCalledWith(exception);
        expect(zodExceptionHandlingStrategy.supports).toHaveBeenCalledWith(exception);
        expect(zodExceptionHandlingStrategy.handle).toHaveBeenCalledWith(exception);
        expect(nestSupportsSpy).not.toHaveBeenCalled();
        expect(result).toEqual(details);
    });

    it("should use the NestJS strategy when the previous strategies do not support the exception", () => {
        const {
            resolver,
            domainExceptionHandlingStrategy,
            prismaExceptionHandlingStrategy,
            zodExceptionHandlingStrategy,
            nestJSExceptionHandlingStrategy,
        } = makeSut();
        const exception = new Error("NestJS error");
        const details = [{ code: "NESTJS_ERROR", message: "NestJS error" }];
        jest.spyOn(domainExceptionHandlingStrategy, "supports").mockReturnValue(false);
        jest.spyOn(prismaExceptionHandlingStrategy, "supports").mockReturnValue(false);
        jest.spyOn(zodExceptionHandlingStrategy, "supports").mockReturnValue(false);
        jest.spyOn(nestJSExceptionHandlingStrategy, "supports").mockReturnValue(true);
        jest.spyOn(nestJSExceptionHandlingStrategy, "handle").mockReturnValue(details);
        const result = resolver.handle(exception);
        expect(domainExceptionHandlingStrategy.supports).toHaveBeenCalledWith(exception);
        expect(prismaExceptionHandlingStrategy.supports).toHaveBeenCalledWith(exception);
        expect(zodExceptionHandlingStrategy.supports).toHaveBeenCalledWith(exception);
        expect(nestJSExceptionHandlingStrategy.supports).toHaveBeenCalledWith(exception);
        expect(nestJSExceptionHandlingStrategy.handle).toHaveBeenCalledWith(exception);
        expect(result).toEqual(details);
    });

    it("should return an internal error when no strategy supports the exception", () => {
        const {
            resolver,
            domainExceptionHandlingStrategy,
            prismaExceptionHandlingStrategy,
            zodExceptionHandlingStrategy,
            nestJSExceptionHandlingStrategy,
        } = makeSut();
        const exception = new Error("Unexpected error");
        jest.spyOn(domainExceptionHandlingStrategy, "supports").mockReturnValue(false);
        jest.spyOn(prismaExceptionHandlingStrategy, "supports").mockReturnValue(false);
        jest.spyOn(zodExceptionHandlingStrategy, "supports").mockReturnValue(false);
        jest.spyOn(nestJSExceptionHandlingStrategy, "supports").mockReturnValue(false);
        const domainHandleSpy = jest.spyOn(domainExceptionHandlingStrategy, "handle");
        const prismaHandleSpy = jest.spyOn(prismaExceptionHandlingStrategy, "handle");
        const zodHandleSpy = jest.spyOn(zodExceptionHandlingStrategy, "handle");
        const nestHandleSpy = jest.spyOn(nestJSExceptionHandlingStrategy, "handle");
        const result = resolver.handle(exception);
        expect(domainExceptionHandlingStrategy.supports).toHaveBeenCalledWith(exception);
        expect(prismaExceptionHandlingStrategy.supports).toHaveBeenCalledWith(exception);
        expect(zodExceptionHandlingStrategy.supports).toHaveBeenCalledWith(exception);
        expect(nestJSExceptionHandlingStrategy.supports).toHaveBeenCalledWith(exception);
        expect(domainHandleSpy).not.toHaveBeenCalled();
        expect(prismaHandleSpy).not.toHaveBeenCalled();
        expect(zodHandleSpy).not.toHaveBeenCalled();
        expect(nestHandleSpy).not.toHaveBeenCalled();
        expect(result).toEqual([{ code: RESPONSE_CODES.INTERNAL_ERROR, message: "An unexpected error occurred." }]);
    });
});

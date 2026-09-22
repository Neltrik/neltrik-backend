import type { CallHandler, ExecutionContext } from "@nestjs/common";
import type { Reflector } from "@nestjs/core";
import { of } from "rxjs";

import { ResponseInterceptor } from "./";
import { extractPayload } from "./extractPayload";

describe("ResponseInterceptor", () => {
    const makeSut = () => {
        const reflector = {
            get: jest.fn(),
        } as unknown as Reflector;
        const context = {
            getHandler: jest.fn(),
        } as unknown as ExecutionContext;
        const next = {
            handle: jest.fn(),
        } as unknown as CallHandler;
        const interceptor = new ResponseInterceptor(reflector);
        return {
            interceptor,
            reflector,
            context,
            next,
        };
    };

    it("should build a successful response", (done) => {
        const { interceptor, reflector, context, next } = makeSut();
        jest.spyOn(reflector, "get").mockReturnValue({
            code: "SUCCESS",
            message: "Request completed successfully.",
        });
        jest.spyOn(next, "handle").mockReturnValue(
            of({
                id: "vacancy-id",
            }),
        );
        interceptor.intercept(context, next).subscribe((response) => {
            expect(response).toEqual({
                data: {
                    id: "vacancy-id",
                },
                code: "SUCCESS",
                message: "Request completed successfully.",
                details: [],
                meta: {},
            });
            expect(reflector.get).toHaveBeenCalledTimes(1);
            expect(next.handle).toHaveBeenCalledTimes(1);
            done();
        });
    });

    it("should throw when response metadata is not found", () => {
        const { interceptor, reflector, context, next } = makeSut();
        jest.spyOn(reflector, "get").mockReturnValue(undefined);
        expect(() => interceptor.intercept(context, next)).toThrow("Response metadata was not found.");
        expect(next.handle).not.toHaveBeenCalled();
    });
});

describe("extractPayload", () => {
    it("should extract data and meta from a valid payload", () => {
        const value = {
            data: { id: "vacancy-id" },
            meta: { nextCursor: "cursor-123", hasMore: true },
        };
        const result = extractPayload(value);
        expect(result).toEqual({
            data: { id: "vacancy-id" },
            meta: { nextCursor: "cursor-123", hasMore: true },
        });
    });

    it("should return the value as data with empty meta when payload does not contain data and meta", () => {
        const value = { id: "vacancy-id" };
        const result = extractPayload(value);
        expect(result).toEqual({ data: value, meta: {} });
    });

    it("should return the value as data when value is null", () => {
        const result = extractPayload(null);
        expect(result).toEqual({ data: null, meta: {} });
    });

    it("should return the value as data when value is undefined", () => {
        const result = extractPayload(undefined);
        expect(result).toEqual({ data: undefined, meta: {} });
    });

    it("should return the value as data when meta is not an object", () => {
        const value = { data: { id: "vacancy-id" }, meta: "invalid-meta" };
        const result = extractPayload(value);
        expect(result).toEqual({ data: value, meta: {} });
    });

    it("should return the value as data when data is missing", () => {
        const value = { meta: { hasMore: true } };
        const result = extractPayload(value);
        expect(result).toEqual({ data: value, meta: {} });
    });
});

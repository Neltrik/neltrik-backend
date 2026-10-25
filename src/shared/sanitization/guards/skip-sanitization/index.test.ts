import type { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { SKIP_SANITIZATION_KEY } from "../../decorators";
import { type Sanitizable, type SanitizationService } from "../../service";
import { SanitizationGuard } from ".";

describe("SanitizationGuard", () => {
    const makeSut = () => {
        const reflector = new Reflector();
        const sanitizeMock = jest.fn((value: Sanitizable) => value);
        const sanitizationService = {
            sanitize: sanitizeMock,
        } satisfies Pick<SanitizationService, "sanitize">;
        const guard = new SanitizationGuard(reflector, sanitizationService);
        const request: Record<string, unknown> = {};
        const httpContext = { getRequest: jest.fn().mockReturnValue(request) };
        const context = {
            getArgs: jest.fn(),
            getArgByIndex: jest.fn(),
            getType: jest.fn(),
            getClass: jest.fn(),
            getHandler: jest.fn(),
            switchToRpc: jest.fn(),
            switchToWs: jest.fn(),
            switchToHttp: jest.fn().mockReturnValue(httpContext),
        } as unknown as ExecutionContext;
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(undefined);
        return { guard, reflector, sanitizationService, sanitizeMock, context, request };
    };

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should allow access when sanitization is skipped", () => {
        const { guard, reflector, sanitizeMock, context, request } = makeSut();
        request.body = { name: "<script>alert(1)</script>" };
        request.params = { id: "<script>1</script>" };
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(true);
        expect(guard.canActivate(context)).toBe(true);
        expect(reflector.getAllAndOverride).toHaveBeenCalledWith(SKIP_SANITIZATION_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        expect(sanitizeMock).not.toHaveBeenCalled();
        expect(request.body).toEqual({ name: "<script>alert(1)</script>" });
        expect(request.params).toEqual({ id: "<script>1</script>" });
    });

    it("should sanitize the request body", () => {
        const { guard, sanitizeMock, context, request } = makeSut();
        const body = { name: "<script>alert(1)</script>" };
        const sanitizedBody = { name: "John" };
        request.body = body;
        sanitizeMock.mockReturnValueOnce(sanitizedBody);
        expect(guard.canActivate(context)).toBe(true);
        expect(sanitizeMock).toHaveBeenCalledWith(body);
        expect(request.body).toEqual(sanitizedBody);
    });

    it("should sanitize the request params", () => {
        const { guard, sanitizeMock, context, request } = makeSut();
        const params = { id: "<script>1</script>" };
        const sanitizedParams = { id: "1" };
        request.params = params;
        sanitizeMock.mockReturnValueOnce(sanitizedParams);
        expect(guard.canActivate(context)).toBe(true);
        expect(sanitizeMock).toHaveBeenCalledWith(params);
        expect(request.params).toEqual(sanitizedParams);
    });

    it("should sanitize both request body and params", () => {
        const { guard, sanitizeMock, context, request } = makeSut();
        const body = { name: "John" };
        const params = { id: "123" };
        const sanitizedBody = { name: "Jane" };
        const sanitizedParams = { id: "456" };
        request.body = body;
        request.params = params;
        sanitizeMock.mockReturnValueOnce(sanitizedBody).mockReturnValueOnce(sanitizedParams);
        expect(guard.canActivate(context)).toBe(true);
        expect(sanitizeMock).toHaveBeenCalledTimes(2);
        expect(sanitizeMock).toHaveBeenNthCalledWith(1, body);
        expect(sanitizeMock).toHaveBeenNthCalledWith(2, params);
        expect(request.body).toEqual(sanitizedBody);
        expect(request.params).toEqual(sanitizedParams);
    });

    it("should not sanitize when the request body and params are missing", () => {
        const { guard, sanitizeMock, context } = makeSut();
        expect(guard.canActivate(context)).toBe(true);
        expect(sanitizeMock).not.toHaveBeenCalled();
    });

    it("should not sanitize when the request body and params are undefined", () => {
        const { guard, sanitizeMock, context, request } = makeSut();
        request.body = undefined;
        request.params = undefined;
        expect(guard.canActivate(context)).toBe(true);
        expect(sanitizeMock).not.toHaveBeenCalled();
    });

    it("should not sanitize when the request body is empty", () => {
        const { guard, sanitizeMock, context, request } = makeSut();
        request.body = null;
        expect(guard.canActivate(context)).toBe(true);
        expect(sanitizeMock).not.toHaveBeenCalled();
    });

    it("should not sanitize when the request params are empty", () => {
        const { guard, sanitizeMock, context, request } = makeSut();
        request.params = null;
        expect(guard.canActivate(context)).toBe(true);
        expect(sanitizeMock).not.toHaveBeenCalled();
    });

    it("should sanitize the body when skip sanitization metadata is false", () => {
        const { guard, reflector, sanitizeMock, context, request } = makeSut();
        const body = { name: "John" };
        request.body = body;
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
        expect(guard.canActivate(context)).toBe(true);
        expect(reflector.getAllAndOverride).toHaveBeenCalledWith(SKIP_SANITIZATION_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        expect(sanitizeMock).toHaveBeenCalledWith(body);
    });

    it("should propagate sanitization service errors", () => {
        const { guard, sanitizeMock, context, request } = makeSut();
        request.body = { name: "John" };
        sanitizeMock.mockImplementation(() => {
            throw new Error("Sanitization error");
        });
        expect(() => guard.canActivate(context)).toThrow("Sanitization error");
    });
});

import type { ExecutionContext } from "@nestjs/common";

type TenantIdFactory = (data: unknown, ctx: ExecutionContext) => string;

const createParamDecoratorMock = jest.fn((factory: TenantIdFactory) => factory);

jest.mock("@nestjs/common", () => ({
    createParamDecorator: createParamDecoratorMock,
}));

jest.mock("@/shared/errors", () => ({
    UnauthorizedError: class UnauthorizedError extends Error {
        constructor(message: string) {
            super(message);
            this.name = "UnauthorizedError";
        }
    },
}));

import { UnauthorizedError } from "@/shared/errors";

import { TenantId } from "./";

describe("TenantId", () => {
    const makeContext = (tenantId?: string | null): ExecutionContext =>
        ({
            switchToHttp: () => ({
                getRequest: () => ({ user: tenantId === undefined ? undefined : { tenantId } }),
            }),
        }) as unknown as ExecutionContext;

    it("should return tenant id successfully", () => {
        const result = TenantId(undefined, makeContext("tenant-id"));
        expect(result).toBe("tenant-id");
    });

    it("should throw UnauthorizedError when user is undefined", () => {
        expect(() => TenantId(undefined, makeContext())).toThrow(new UnauthorizedError("Tenant ID not found"));
    });

    it("should throw UnauthorizedError when tenant id is null", () => {
        expect(() => TenantId(undefined, makeContext(null))).toThrow(new UnauthorizedError("Tenant ID not found"));
    });

    it("should throw UnauthorizedError when tenant id is empty", () => {
        expect(() => TenantId(undefined, makeContext(""))).toThrow(new UnauthorizedError("Tenant ID not found"));
    });
});

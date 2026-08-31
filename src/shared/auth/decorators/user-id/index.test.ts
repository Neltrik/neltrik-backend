import type { ExecutionContext } from "@nestjs/common";

type UserIdFactory = (data: unknown, ctx: ExecutionContext) => string;
const createParamDecoratorMock = jest.fn((factory: UserIdFactory) => factory);

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

import { UserId } from "./";

describe("UserId", () => {
    const makeContext = (userId?: string | null): ExecutionContext =>
        ({
            switchToHttp: () => ({
                getRequest: () => ({
                    user: userId === undefined ? undefined : { userId },
                }),
            }),
        }) as unknown as ExecutionContext;

    it("should return user id successfully", () => {
        const result = UserId(undefined, makeContext("user-id"));
        expect(result).toBe("user-id");
    });

    it("should throw UnauthorizedError when user is undefined", () => {
        expect(() => UserId(undefined, makeContext())).toThrow(new UnauthorizedError("User ID not found"));
    });

    it("should throw UnauthorizedError when user id is null", () => {
        expect(() => UserId(undefined, makeContext(null))).toThrow(new UnauthorizedError("User ID not found"));
    });

    it("should throw UnauthorizedError when user id is empty", () => {
        expect(() => UserId(undefined, makeContext(""))).toThrow(new UnauthorizedError("User ID not found"));
    });
});

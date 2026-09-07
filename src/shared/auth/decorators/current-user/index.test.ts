import type { ExecutionContext } from "@nestjs/common";

import type { UserPayload } from "./type";

type CurrentUserFactory = (
    data: keyof UserPayload | undefined,
    ctx: ExecutionContext,
) => UserPayload | UserPayload[keyof UserPayload];

let currentUserFactory: CurrentUserFactory;
const createParamDecoratorMock = jest.fn((factory: CurrentUserFactory) => {
    currentUserFactory = factory;
    return factory;
});

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

import { CurrentUser } from "./";

describe("CurrentUser", () => {
    const user: UserPayload = {
        userId: "user-id",
        tenantId: "tenant-id",
        roleCode: "role-code",
        sessionId: "session-id",
    };

    const makeContext = (currentUser?: UserPayload): ExecutionContext =>
        ({
            switchToHttp: () => ({ getRequest: () => ({ user: currentUser }) }),
        }) as unknown as ExecutionContext;

    beforeAll(() => {
        currentUserFactory = CurrentUser as unknown as CurrentUserFactory;
    });

    it("should return current user successfully", () => {
        const result = currentUserFactory(undefined, makeContext(user));
        expect(result).toEqual(user);
    });

    it("should return user id when data is provided", () => {
        const result = currentUserFactory("userId", makeContext(user));
        expect(result).toBe("user-id");
    });

    it("should return tenant id when data is provided", () => {
        const result = currentUserFactory("tenantId", makeContext(user));
        expect(result).toBe("tenant-id");
    });

    it("should return role code when data is provided", () => {
        const result = currentUserFactory("roleCode", makeContext(user));
        expect(result).toBe("role-code");
    });

    it("should return session id when data is provided", () => {
        const result = currentUserFactory("sessionId", makeContext(user));
        expect(result).toBe("session-id");
    });

    it("should throw UnauthorizedError when user is undefined", () => {
        expect(() => currentUserFactory(undefined, makeContext())).toThrow(
            new UnauthorizedError("User not authenticated"),
        );
    });

    it("should throw UnauthorizedError when user is null", () => {
        const context = {
            switchToHttp: () => ({ getRequest: () => ({ user: null }) }),
        } as unknown as ExecutionContext;
        expect(() => currentUserFactory(undefined, context)).toThrow(new UnauthorizedError("User not authenticated"));
    });
});

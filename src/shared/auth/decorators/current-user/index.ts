import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import { type Request } from "express";

import { UnauthorizedError } from "@/shared/errors";

import { type UserPayload } from "./type";

export const CurrentUser = createParamDecorator((data: keyof UserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user;
    if (!user) {
        throw new UnauthorizedError("User not authenticated");
    }
    if (data) {
        return user[data];
    }
    return user;
});

export { UserPayload };

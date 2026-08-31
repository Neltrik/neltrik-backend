import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import { type Request } from "express";

import { UnauthorizedError } from "@/shared/errors";

export const UserId = createParamDecorator((data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const userId = request.user?.userId;
    if (!userId) {
        throw new UnauthorizedError("User ID not found");
    }
    return userId;
});

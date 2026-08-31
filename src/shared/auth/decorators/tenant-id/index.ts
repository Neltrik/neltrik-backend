import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import { type Request } from "express";

import { UnauthorizedError } from "@/shared/errors";

export const TenantId = createParamDecorator((data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const tenantId = request.user?.tenantId;
    if (!tenantId) {
        throw new UnauthorizedError("Tenant ID not found");
    }
    return tenantId;
});

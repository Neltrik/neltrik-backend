import { HttpStatus, Injectable } from "@nestjs/common";

import { ForbiddenError, UnauthorizedError } from "@/shared/errors";

import { HttpStatusStrategy } from "../../contracts";

@Injectable()
export class GlobalDomainHttpStatusStrategy extends HttpStatusStrategy {
    public supports(exception: unknown): boolean {
        return exception instanceof ForbiddenError || exception instanceof UnauthorizedError;
    }

    public resolve(exception: unknown): number {
        if (exception instanceof ForbiddenError) {
            return HttpStatus.FORBIDDEN;
        }
        if (exception instanceof UnauthorizedError) {
            return HttpStatus.UNAUTHORIZED;
        }
        return HttpStatus.BAD_REQUEST;
    }
}

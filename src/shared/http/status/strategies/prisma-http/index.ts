import { HttpStatus, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { HttpStatusStrategy } from "../../contracts";

@Injectable()
export class PrismaHttpStatusStrategy extends HttpStatusStrategy {
    public supports(exception: unknown): boolean {
        return exception instanceof Prisma.PrismaClientKnownRequestError;
    }

    public resolve(exception: unknown): number {
        if (!(exception instanceof Prisma.PrismaClientKnownRequestError)) {
            return HttpStatus.INTERNAL_SERVER_ERROR;
        }
        switch (exception.code) {
            case "P2002":
                return HttpStatus.CONFLICT;
            case "P2025":
                return HttpStatus.NOT_FOUND;
            case "P2003":
            case "P2014":
                return HttpStatus.BAD_REQUEST;
            default:
                return HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }
}

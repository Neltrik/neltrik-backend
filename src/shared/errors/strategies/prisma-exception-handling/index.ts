import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { RESPONSE_CODES } from "@/shared/http";

import { ErrorDetail } from "../../contracts";
import { ExceptionHandlingStrategy } from "../exception-strategy";

@Injectable()
export class PrismaExceptionHandlingStrategy extends ExceptionHandlingStrategy {
    public supports(error: unknown): boolean {
        return error instanceof Prisma.PrismaClientKnownRequestError;
    }

    public handle(error: unknown): ErrorDetail[] {
        if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
            return [{ code: RESPONSE_CODES.INTERNAL_ERROR, message: "An unexpected error occurred." }];
        }
        switch (error.code) {
            case "P2002":
                return [
                    { code: RESPONSE_CODES.CONFLICT, message: "A record with the same unique fields already exists." },
                ];
            case "P2025":
                return [{ code: RESPONSE_CODES.NOT_FOUND, message: "Record not found." }];
            case "P2003":
            case "P2014":
                return [{ code: RESPONSE_CODES.BAD_REQUEST, message: "Invalid reference." }];
            default:
                return [{ code: RESPONSE_CODES.INTERNAL_ERROR, message: "An unexpected database error occurred." }];
        }
    }
}

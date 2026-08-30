import { Injectable } from "@nestjs/common";

import { RESPONSE_CODES } from "@/shared/http";
import { ZodValidationException } from "@/shared/zod";

import { ErrorDetail } from "../../contracts";
import { ExceptionHandlingStrategy } from "../exception-strategy";

@Injectable()
export class ZodExceptionHandlingStrategy extends ExceptionHandlingStrategy {
    public supports(error: unknown): boolean {
        return error instanceof ZodValidationException;
    }

    public handle(error: unknown): ErrorDetail[] {
        if (!(error instanceof ZodValidationException)) {
            return [{ code: "INTERNAL_ERROR", message: "An unexpected error occurred." }];
        }
        return error.zodError.issues.map((issue): ErrorDetail => ({
            code: RESPONSE_CODES.VALIDATION_ERROR,
            message: issue.message,
            field: issue.path.map(String).join("."),
        }));
    }
}

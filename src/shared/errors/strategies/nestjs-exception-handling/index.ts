import { HttpException, Injectable } from "@nestjs/common";

import { RESPONSE_CODES } from "@/shared/http";

import { ErrorDetail } from "../../contracts";
import { ExceptionHandlingStrategy } from "../exception-strategy";

@Injectable()
export class NestJSExceptionHandlingStrategy extends ExceptionHandlingStrategy {
    public supports(error: unknown): boolean {
        return error instanceof HttpException;
    }

    public handle(error: unknown): ErrorDetail[] {
        if (!(error instanceof HttpException)) {
            return [{ code: RESPONSE_CODES.INTERNAL_ERROR, message: "An unexpected error occurred." }];
        }
        const response = error.getResponse();
        if (typeof response === "string") {
            return [{ code: error.name.toUpperCase(), message: response }];
        }
        if (typeof response === "object") {
            const message = this.extractMessage(response);
            return [{ code: error.name.toUpperCase(), message }];
        }
        return [{ code: RESPONSE_CODES.INTERNAL_ERROR, message: "An unexpected error occurred." }];
    }

    private extractMessage(response: unknown): string {
        if (typeof response === "object" && response !== null) {
            const obj = response as Record<string, unknown>;
            if (Array.isArray(obj.message)) {
                return obj.message.join(", ");
            }
            if (typeof obj.message === "string") {
                return obj.message;
            }
            if (typeof obj.error === "string") {
                return obj.error;
            }
        }
        return "An unexpected error occurred.";
    }
}

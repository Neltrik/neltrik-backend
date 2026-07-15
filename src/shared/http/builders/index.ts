import { type ApiResponse } from "../contracts/api-response";

export class ResponseBuilder {
    static build<T>(
        data: T | null,
        code: string,
        message: string,
        details: unknown[] = [],
        meta: Record<string, unknown> = {},
    ): ApiResponse<T> {
        return {
            data,
            code,
            message,
            details: details.length === 1 ? [] : details,
            meta,
        };
    }
}

import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { Response } from "express";

import { ExceptionManager } from "@/shared/errors";

import { ResponseBuilder } from "../builders";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    constructor(private readonly exceptionManager: ExceptionManager) {}

    public catch(exception: unknown, host: ArgumentsHost): void {
        const context = host.switchToHttp();
        const response = context.getResponse<Response>();
        const details = this.exceptionManager.handle(exception);
        const error = details[0]!;
        response.json(ResponseBuilder.build(null, error.code, error.message, details));
    }
}

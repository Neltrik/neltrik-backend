import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { Response } from "express";

import { HttpStatusResolver, ResponseBuilder } from "@/shared/http";

import { ExceptionResolver } from "../exceptions";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    constructor(
        private readonly exceptionResolver: ExceptionResolver,
        private readonly httpStatusResolver: HttpStatusResolver,
    ) {}

    public catch(exception: unknown, host: ArgumentsHost): void {
        const context = host.switchToHttp();
        const response = context.getResponse<Response>();
        const details = this.exceptionResolver.handle(exception);
        const status = this.httpStatusResolver.resolve(exception);
        const error = details[0]!;
        response.status(status).json(ResponseBuilder.build(null, error.code, error.message, details));
    }
}

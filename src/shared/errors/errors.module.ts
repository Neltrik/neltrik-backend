import { Global, Module } from "@nestjs/common";

import { ExceptionResolver } from "./exceptions";
import { GlobalExceptionFilter } from "./filters";
import {
    DomainExceptionHandlingStrategy,
    NestJSExceptionHandlingStrategy,
    PrismaExceptionHandlingStrategy,
    ZodExceptionHandlingStrategy,
} from "./strategies";

@Global()
@Module({
    providers: [
        ExceptionResolver,
        DomainExceptionHandlingStrategy,
        NestJSExceptionHandlingStrategy,
        PrismaExceptionHandlingStrategy,
        ZodExceptionHandlingStrategy,
        GlobalExceptionFilter,
    ],
    exports: [ExceptionResolver, GlobalExceptionFilter],
})
export class ErrorsModule {}

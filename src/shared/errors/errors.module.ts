import { Global, Module } from "@nestjs/common";

import { ExceptionResolver } from "./exceptions";
import { GlobalExceptionFilter } from "./filters";
import {
    DomainExceptionHandlingStrategy,
    NestJSExceptionHandlingStrategy,
    ZodExceptionHandlingStrategy,
} from "./strategies";

@Global()
@Module({
    providers: [
        ExceptionResolver,
        DomainExceptionHandlingStrategy,
        NestJSExceptionHandlingStrategy,
        ZodExceptionHandlingStrategy,
        GlobalExceptionFilter,
    ],
    exports: [ExceptionResolver, GlobalExceptionFilter],
})
export class ErrorsModule {}

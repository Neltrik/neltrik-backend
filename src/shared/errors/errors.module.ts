import { Global, Module } from "@nestjs/common";

import { ExceptionResolver } from "./exceptions";
import { GlobalExceptionFilter } from "./filters";
import { DomainExceptionHandlingStrategy } from "./strategies";

@Global()
@Module({
    providers: [ExceptionResolver, DomainExceptionHandlingStrategy, GlobalExceptionFilter],
    exports: [ExceptionResolver, GlobalExceptionFilter],
})
export class ErrorsModule {}

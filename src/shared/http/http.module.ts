import { Global, Module } from "@nestjs/common";

import { ResponseInterceptor } from "./interceptors";
import { DomainHttpStatusStrategy, HttpStatusResolver, ZodHttpStatusStrategy } from "./status";

@Global()
@Module({
    providers: [ResponseInterceptor, DomainHttpStatusStrategy, HttpStatusResolver, ZodHttpStatusStrategy],
    exports: [ResponseInterceptor, HttpStatusResolver],
})
export class HttpModule {}

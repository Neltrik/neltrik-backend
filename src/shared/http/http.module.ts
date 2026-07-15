import { Global, Module } from "@nestjs/common";

import { ResponseInterceptor } from "./interceptors";
import { DomainHttpStatusStrategy, HttpStatusResolver } from "./status";

@Global()
@Module({
    providers: [ResponseInterceptor, DomainHttpStatusStrategy, HttpStatusResolver],
    exports: [ResponseInterceptor, HttpStatusResolver],
})
export class HttpModule {}

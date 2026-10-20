import { Global, Module } from "@nestjs/common";

import { ResponseInterceptor } from "./interceptors";
import {
    DomainHttpStatusStrategy,
    GlobalDomainHttpStatusStrategy,
    HttpStatusResolver,
    ZodHttpStatusStrategy,
} from "./status";

@Global()
@Module({
    providers: [
        ResponseInterceptor,
        DomainHttpStatusStrategy,
        GlobalDomainHttpStatusStrategy,
        HttpStatusResolver,
        ZodHttpStatusStrategy,
    ],
    exports: [ResponseInterceptor, HttpStatusResolver],
})
export class HttpModule {}

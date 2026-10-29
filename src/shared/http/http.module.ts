import { Global, Module } from "@nestjs/common";

import { ResponseInterceptor } from "./interceptors";
import {
    DomainHttpStatusStrategy,
    GlobalDomainHttpStatusStrategy,
    HttpStatusResolver,
    PrismaHttpStatusStrategy,
    ZodHttpStatusStrategy,
} from "./status";

@Global()
@Module({
    providers: [
        ResponseInterceptor,
        DomainHttpStatusStrategy,
        GlobalDomainHttpStatusStrategy,
        HttpStatusResolver,
        PrismaHttpStatusStrategy,
        ZodHttpStatusStrategy,
    ],
    exports: [ResponseInterceptor, HttpStatusResolver],
})
export class HttpModule {}

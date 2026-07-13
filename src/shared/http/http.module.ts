import { Global, Module } from "@nestjs/common";

import { ResponseInterceptor } from "./interceptors";

@Global()
@Module({
    providers: [ResponseInterceptor],
    exports: [ResponseInterceptor],
})
export class HttpModule {}

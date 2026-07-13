import { Global, Module } from "@nestjs/common";

import { SanitizationPipe } from "./pipe";
import { SanitizationService } from "./service";

@Global()
@Module({
    providers: [SanitizationService, SanitizationPipe],
    exports: [SanitizationService, SanitizationPipe],
})
export class SanitizationModule {}

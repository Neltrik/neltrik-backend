import { Global, Module } from "@nestjs/common";

import { SanitizationGuard } from "./guards";
import { SanitizationService } from "./service";

@Global()
@Module({
    providers: [SanitizationService, SanitizationGuard],
    exports: [SanitizationService, SanitizationGuard],
})
export class SanitizationModule {}

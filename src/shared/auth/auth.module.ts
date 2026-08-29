import { Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { env } from "@/config/index";

import { AuthenticationGuard } from "./guards";
import { TokenVerifier } from "./providers";

@Global()
@Module({
    imports: [JwtModule.register({ secret: env.JWT_SECRET })],
    providers: [TokenVerifier, AuthenticationGuard],
    exports: [TokenVerifier, AuthenticationGuard],
})
export class AuthModule {}

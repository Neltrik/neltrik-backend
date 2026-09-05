import { forwardRef, Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { env } from "@/config/index";
import { AuthenticationModule } from "@/core/authentication/authentication.module";

import { AuthenticationGuard } from "./";
import { TokenVerifier } from "./providers";

@Global()
@Module({
    imports: [JwtModule.register({ secret: env.JWT_SECRET }), forwardRef(() => AuthenticationModule)],
    providers: [TokenVerifier, AuthenticationGuard],
    exports: [TokenVerifier, AuthenticationGuard],
})
export class AuthModule {}

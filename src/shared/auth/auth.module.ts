import { forwardRef, Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { env } from "@/config/index";
import { AuthenticationModule } from "@/core/authentication/authentication.module";

import { AuthenticationGuard } from "./";
import { CsrfTokenProvider, TokenVerifier } from "./providers";

@Global()
@Module({
    imports: [JwtModule.register({ secret: env.JWT_SECRET }), forwardRef(() => AuthenticationModule)],
    providers: [CsrfTokenProvider, TokenVerifier, AuthenticationGuard],
    exports: [CsrfTokenProvider, TokenVerifier, AuthenticationGuard],
})
export class AuthModule {}

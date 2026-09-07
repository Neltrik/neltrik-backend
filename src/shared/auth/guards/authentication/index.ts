import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";

import { CookieHelper } from "@/shared/http";

import { IS_PUBLIC_KEY } from "../../decorators";
import { TokenVerifier } from "../../providers";
import { SessionValidator } from "./contracts";

@Injectable()
export class AuthenticationGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly tokenVerifier: TokenVerifier,
        private readonly sessionValidator: SessionValidator,
    ) {}

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest<Request>();
        const token = CookieHelper.get(request, "accessToken");
        if (!token) {
            throw new UnauthorizedException("Access token not found");
        }
        const payload = await this.tokenVerifier.verify(token);
        const isValid = await this.sessionValidator.validate(payload.sessionId);
        if (!isValid) {
            throw new UnauthorizedException("Invalid or revoked session");
        }
        request.user = {
            userId: payload.sub,
            tenantId: payload.tenantId,
            roleCode: payload.roleCode,
            sessionId: payload.sessionId,
        };
        request.account = {
            emailVerified: payload.emailVerified,
        };
        return true;
    }
}

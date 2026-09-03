import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";

import { SKIP_EMAIL_VERIFICATION_KEY } from "../../";

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    public canActivate(context: ExecutionContext): boolean {
        const skipEmailVerification = this.reflector.getAllAndOverride<boolean>(SKIP_EMAIL_VERIFICATION_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (skipEmailVerification) {
            return true;
        }
        const request = context.switchToHttp().getRequest<Request>();
        const user = request.user;
        const account = request.account;
        if (!account || !user) {
            throw new ForbiddenException("User not authenticated");
        }
        if (!account.emailVerified) {
            throw new ForbiddenException("Email not verified");
        }
        return true;
    }
}

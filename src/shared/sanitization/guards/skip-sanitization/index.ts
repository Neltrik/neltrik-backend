import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { SKIP_SANITIZATION_KEY } from "../../decorators";
import { Sanitizable, SanitizationService } from "../../service";

@Injectable()
export class SanitizationGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly sanitizationService: SanitizationService,
    ) {}

    public canActivate(context: ExecutionContext): boolean {
        const skip = this.reflector.getAllAndOverride<boolean>(SKIP_SANITIZATION_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (skip) {
            return true;
        }
        const request = context.switchToHttp().getRequest<Record<string, unknown>>();
        if (request.body) {
            request.body = this.sanitizationService.sanitize(request.body as Sanitizable);
        }
        if (request.params) {
            request.params = this.sanitizationService.sanitize(request.params as Sanitizable);
        }
        return true;
    }
}

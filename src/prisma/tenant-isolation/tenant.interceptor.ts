import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Request } from "express";
import { Observable } from "rxjs";

import { TenantContextService } from "./tenant-context.service";

@Injectable()
export class TenantInterceptor implements NestInterceptor {
    constructor(private readonly tenantContextService: TenantContextService) {}

    public intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const request = context.switchToHttp().getRequest<Request>();
        const user = request.user;
        const isPlatformAdmin = user?.roleCode === "PLATFORM_ADMIN";
        const tenantId = isPlatformAdmin ? null : (user?.tenantId ?? null);
        const userId = user?.userId ?? null;
        return new Observable<unknown>((observer) => {
            this.tenantContextService.runWithContext(tenantId, userId, isPlatformAdmin, () => {
                next.handle().subscribe({
                    next: (value: unknown) => observer.next(value),
                    error: (err: unknown) => observer.error(err),
                    complete: () => observer.complete(),
                });
            });
        });
    }
}

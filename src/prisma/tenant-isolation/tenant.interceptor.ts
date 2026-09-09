import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Request } from "express";
import { Observable } from "rxjs";

import { TenantContextService } from "./tenant-context.service";

@Injectable()
export class TenantInterceptor implements NestInterceptor {
    constructor(private readonly tenantContextService: TenantContextService) {}

    public intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const request = context.switchToHttp().getRequest<Request>();
        let tenantId = request.user?.tenantId ?? null;
        if (request.user?.roleCode === "PLATFORM_ADMIN") {
            tenantId = null;
        }
        return new Observable<unknown>((observer) => {
            this.tenantContextService.runWithTenant(tenantId, () => {
                next.handle().subscribe({
                    next: (value: unknown) => observer.next(value),
                    error: (err: unknown) => observer.error(err),
                    complete: () => observer.complete(),
                });
            });
        });
    }
}

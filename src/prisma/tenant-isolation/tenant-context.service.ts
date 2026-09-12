import { Injectable } from "@nestjs/common";
import { AsyncLocalStorage } from "async_hooks";

interface TenantContext {
    tenantId: string | null;
    userId: string | null;
    isPlatformAdmin: boolean;
}

@Injectable()
export class TenantContextService {
    private readonly als = new AsyncLocalStorage<TenantContext>();

    public runWithContext<T>(tenantId: string | null, userId: string | null, isPlatformAdmin: boolean, fn: () => T): T {
        return this.als.run({ tenantId, userId, isPlatformAdmin }, fn);
    }

    public getCurrentTenant(): string | null {
        const store = this.als.getStore();
        return store?.tenantId ?? null;
    }

    public getCurrentUserId(): string | null {
        const store = this.als.getStore();
        return store?.userId ?? null;
    }

    public isPlatformAdmin(): boolean {
        const store = this.als.getStore();
        return store?.isPlatformAdmin ?? false;
    }

    public setTenant(tenantId: string | null): void {
        const store = this.als.getStore();
        if (store) {
            store.tenantId = tenantId;
        }
    }
}

import { Injectable } from "@nestjs/common";
import { AsyncLocalStorage } from "async_hooks";

@Injectable()
export class TenantContextService {
    private readonly als = new AsyncLocalStorage<{ tenantId: string | null }>();

    public runWithTenant<T>(tenantId: string | null, fn: () => T): T {
        return this.als.run({ tenantId }, fn);
    }

    public getCurrentTenant(): string | null {
        const store = this.als.getStore();
        return store?.tenantId ?? null;
    }

    public setTenant(tenantId: string | null): void {
        const store = this.als.getStore();
        if (store) {
            store.tenantId = tenantId;
        }
    }
}

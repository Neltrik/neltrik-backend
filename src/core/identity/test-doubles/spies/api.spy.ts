import { type AuditApi, type CreateAuditEventInput } from "@/core/audit/api";

export class AuthorizationRoleApiSpy {
    public getRolesByTenantId = jest.fn();
    public validate = jest.fn<Promise<void>, [string]>();
    public validateForTenant = jest.fn<Promise<void>, [{ roleId: string; tenantId: string }]>();
    public getRoleById = jest.fn<Promise<{ id: string; code: string; scope: "PLATFORM" | "TENANT" }>, [string]>();
}

export class AuditApiSpy {
    public record = jest.fn<Promise<void>, [CreateAuditEventInput]>();
    public recordWithFn: AuditApi["recordWithFn"] = jest.fn(
        async <T>(_input: Omit<CreateAuditEventInput, "status">, fn: () => Promise<T>): Promise<T> => {
            return fn();
        },
    );
}

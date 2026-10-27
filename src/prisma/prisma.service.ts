import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

import { TenantContextService } from "./tenant-isolation";

const TENANT_MODELS = [
    "User",
    "Role",
    "Permission",
    "TenantRoleConfiguration",
    "Invitation",
    "AuditEvent",
    "File",
    "FileQuota",
    "Notification",
    "NotificationPreference",
] as const;
const TENANT_MODELS_WITH_GLOBAL = ["NotificationTemplate"] as const;
const OWNERSHIP_MODELS = ["AuthenticationSession", "NotificationPreference"] as const;

type TenantModel = (typeof TENANT_MODELS)[number];
type TenantModelWithGlobal = (typeof TENANT_MODELS_WITH_GLOBAL)[number];
type OwnershipModel = (typeof OWNERSHIP_MODELS)[number];

function isTenantModel(model: string): model is TenantModel {
    return TENANT_MODELS.includes(model as TenantModel);
}

function isTenantModelWithGlobal(model: string): model is TenantModelWithGlobal {
    return TENANT_MODELS_WITH_GLOBAL.includes(model as TenantModelWithGlobal);
}

function isOwnershipModel(model: string): model is OwnershipModel {
    return OWNERSHIP_MODELS.includes(model as OwnershipModel);
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function isWriteOperation(operation: string): boolean {
    return operation === "create" || operation === "upsert";
}

type ScopeFilter = { tenantId?: string; tenantIdWithGlobal?: string; ownerId?: string };

function applyTenantFilter(where: Record<string, unknown>, tenantId: string): Record<string, unknown> {
    return { ...where, tenantId };
}

function applyTenantWithGlobalFilter(where: Record<string, unknown>, tenantId: string): Record<string, unknown> {
    return { ...where, OR: [{ tenantId }, { tenantId: null }] };
}

function applyOwnerFilter(where: Record<string, unknown>, ownerId: string): Record<string, unknown> {
    return { ...where, ownerId };
}

function buildWhere(where: Record<string, unknown>, filter: ScopeFilter): Record<string, unknown> {
    let result = where;
    if (filter.tenantId) {
        result = applyTenantFilter(result, filter.tenantId);
    }
    if (filter.tenantIdWithGlobal) {
        result = applyTenantWithGlobalFilter(result, filter.tenantIdWithGlobal);
    }
    if (filter.ownerId) {
        result = applyOwnerFilter(result, filter.ownerId);
    }
    return result;
}

function resolveScope(
    model: string,
    tenantId: string | null | undefined,
    userId: string | null | undefined,
): ScopeFilter {
    const filter: ScopeFilter = {};
    if (tenantId && isTenantModel(model)) {
        filter.tenantId = tenantId;
    }
    if (tenantId && isTenantModelWithGlobal(model)) {
        filter.tenantIdWithGlobal = tenantId;
    }
    if (userId && isOwnershipModel(model)) {
        filter.ownerId = userId;
    }
    return filter;
}

function hasScope(filter: ScopeFilter): boolean {
    return Boolean(filter.tenantId || filter.tenantIdWithGlobal || filter.ownerId);
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    public readonly tenantClient: PrismaClient;

    constructor(private readonly tenantContext: TenantContextService) {
        super();
        this.tenantClient = this.$extends({
            query: {
                $allModels: {
                    async $allOperations({ model, operation, args, query }) {
                        if (tenantContext.isPlatformAdmin()) {
                            return query(args);
                        }
                        if (isWriteOperation(operation)) {
                            return query(args);
                        }
                        const tenantId = tenantContext.getCurrentTenant();
                        const userId = tenantContext.getCurrentUserId();
                        const filter = resolveScope(model, tenantId, userId);
                        if (!hasScope(filter)) {
                            return query(args);
                        }
                        const safeArgs = args as unknown as Record<string, unknown>;
                        const where = isRecord(safeArgs.where) ? safeArgs.where : {};
                        safeArgs.where = buildWhere(where, filter);
                        return query(args);
                    },
                },
            },
        }) as PrismaClient;
    }

    public async onModuleInit(): Promise<void> {
        await this.$connect();
    }

    public async onModuleDestroy(): Promise<void> {
        await this.$disconnect();
    }
}

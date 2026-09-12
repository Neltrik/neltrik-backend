import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

import { TenantContextService } from "./tenant-isolation";

const TENANT_MODELS = ["User", "Role", "Permission", "TenantRoleConfiguration", "Invitation"] as const;
const OWNERSHIP_MODELS = ["AuthenticationSession"] as const;

type TenantModel = (typeof TENANT_MODELS)[number];
type OwnershipModel = (typeof OWNERSHIP_MODELS)[number];

function isTenantModel(model: string): model is TenantModel {
    return TENANT_MODELS.includes(model as TenantModel);
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
                        const requiresTenant = tenantId && isTenantModel(model);
                        const requiresOwner = userId && isOwnershipModel(model);
                        if (!requiresTenant && !requiresOwner) {
                            return query(args);
                        }
                        const safeArgs = args as unknown as Record<string, unknown>;
                        const where = isRecord(safeArgs.where) ? safeArgs.where : {};
                        let newWhere = { ...where };
                        if (requiresTenant) {
                            newWhere = { ...newWhere, tenantId };
                        }
                        if (requiresOwner) {
                            newWhere = { ...newWhere, ownerId: userId };
                        }
                        safeArgs.where = newWhere;
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

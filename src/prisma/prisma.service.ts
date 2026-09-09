import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

import { TenantContextService } from "./tenant-isolation";

const TENANT_MODELS = ["User", "Role", "Permission", "TenantRoleConfiguration", "Invitation"] as const;

type TenantModel = (typeof TENANT_MODELS)[number];

function isTenantModel(model: string): model is TenantModel {
    return TENANT_MODELS.includes(model as TenantModel);
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    public readonly tenantClient: PrismaClient;

    constructor(private readonly tenantContext: TenantContextService) {
        super();
        this.tenantClient = this.$extends({
            query: {
                $allModels: {
                    async $allOperations({ args, query }) {
                        const tenantId = tenantContext.getCurrentTenant();
                        const model = (this as { name: string }).name;
                        const action = (this as { type: string }).type;
                        if (!tenantId) {
                            return query(args);
                        }
                        if (action === "create" || action === "upsert") {
                            return query(args);
                        }
                        if (!isTenantModel(model)) {
                            return query(args);
                        }
                        const where = (args as Record<string, unknown>).where;
                        const safeWhere = isRecord(where) ? where : {};
                        (args as Record<string, unknown>).where = { ...safeWhere, tenantId };
                        return query(args);
                    },
                },
            },
        }) as PrismaClient;
    }

    async onModuleInit() {
        await this.$connect();
    }
}

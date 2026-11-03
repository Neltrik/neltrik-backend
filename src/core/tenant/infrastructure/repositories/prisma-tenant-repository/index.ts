import { Injectable } from "@nestjs/common";

import { PrismaService } from "@/prisma/index";
import { OptimisticLockError } from "@/shared/errors";

import { Tenant } from "../../../domain/entities";
import { TenantRepository } from "../../../domain/interfaces";
import { TenantMapper } from "../../mappers";

@Injectable()
export class PrismaTenantRepository extends TenantRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    public async create(tenant: Tenant): Promise<void> {
        await this.prisma.tenantClient.tenant.create({
            data: TenantMapper.toPersistence(tenant),
        });
    }

    public async update(tenant: Tenant): Promise<void> {
        const result = await this.prisma.tenantClient.tenant.updateMany({
            where: { id: tenant.id, version: tenant.version },
            data: { ...TenantMapper.toPersistence(tenant), version: tenant.version + 1 },
        });
        if (result.count === 0) {
            throw new OptimisticLockError();
        }
    }

    public async get(id: string): Promise<Tenant | null> {
        const tenant = await this.prisma.tenantClient.tenant.findUnique({ where: { id } });
        if (!tenant) {
            return null;
        }
        return TenantMapper.toDomain(tenant);
    }

    public async list(): Promise<Tenant[]> {
        const tenants = await this.prisma.tenantClient.tenant.findMany();
        return tenants.map((tenant) => TenantMapper.toDomain(tenant));
    }
}

import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/index";

import { Tenant } from "../../../domain/entities/tenant";
import { TenantRepository } from "../../../domain/interfaces/tenant-repository";
import { TenantMapper } from "../../mappers";

@Injectable()
export class PrismaTenantRepository extends TenantRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    public async create(tenant: Tenant): Promise<void> {
        await this.prisma.tenant.create({
            data: TenantMapper.toPersistence(tenant),
        });
    }

    public async update(tenant: Tenant): Promise<void> {
        await this.prisma.tenant.update({
            where: { id: tenant.id },
            data: TenantMapper.toPersistence(tenant),
        });
    }

    public async get(id: string): Promise<Tenant | null> {
        const tenant = await this.prisma.tenant.findUnique({ where: { id } });
        if (!tenant) {
            return null;
        }
        return TenantMapper.toDomain(tenant);
    }
}

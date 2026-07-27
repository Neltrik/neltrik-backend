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
}

import { Injectable } from "@nestjs/common";

import { PrismaService } from "@/prisma/index";
import { OptimisticLockError } from "@/shared/errors";

import { TenantRoleConfiguration } from "../../../domain/entities";
import { TenantRoleConfigurationRepository } from "../../../domain/interfaces";
import { TenantRoleConfigurationMapper } from "../../mappers";

@Injectable()
export class PrismaTenantRoleConfigurationRepository extends TenantRoleConfigurationRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    public async create(tenantRoleConfiguration: TenantRoleConfiguration): Promise<TenantRoleConfiguration> {
        const configuration = await this.prisma.tenantClient.tenantRoleConfiguration.create({
            data: TenantRoleConfigurationMapper.toPersistence(tenantRoleConfiguration),
        });
        return TenantRoleConfigurationMapper.toDomain(configuration);
    }

    public async update(tenantRoleConfiguration: TenantRoleConfiguration): Promise<TenantRoleConfiguration> {
        const result = await this.prisma.tenantClient.tenantRoleConfiguration.updateMany({
            where: { id: tenantRoleConfiguration.id, version: tenantRoleConfiguration.version },
            data: {
                ...TenantRoleConfigurationMapper.toPersistence(tenantRoleConfiguration),
                version: tenantRoleConfiguration.version + 1,
            },
        });
        if (result.count === 0) {
            throw new OptimisticLockError();
        }
        const updated = await this.prisma.tenantClient.tenantRoleConfiguration.findUnique({
            where: { id: tenantRoleConfiguration.id },
        });
        if (!updated) {
            throw new OptimisticLockError();
        }
        return TenantRoleConfigurationMapper.toDomain(updated);
    }

    public async delete(id: string): Promise<void> {
        await this.prisma.tenantClient.tenantRoleConfiguration.delete({
            where: { id },
        });
    }

    public async get(id: string): Promise<TenantRoleConfiguration | null> {
        const configuration = await this.prisma.tenantClient.tenantRoleConfiguration.findUnique({ where: { id } });
        if (!configuration) {
            return null;
        }
        return TenantRoleConfigurationMapper.toDomain(configuration);
    }

    public async findByTenantAndRole(tenantId: string, roleId: string): Promise<TenantRoleConfiguration | null> {
        const configuration = await this.prisma.tenantClient.tenantRoleConfiguration.findUnique({
            where: { tenantId_roleId: { tenantId, roleId } },
        });
        if (!configuration) {
            return null;
        }
        return TenantRoleConfigurationMapper.toDomain(configuration);
    }

    public async list(tenantId: string): Promise<TenantRoleConfiguration[]> {
        const configurations = await this.prisma.tenantClient.tenantRoleConfiguration.findMany({
            where: { tenantId },
        });
        return configurations.map((configuration) => TenantRoleConfigurationMapper.toDomain(configuration));
    }
}

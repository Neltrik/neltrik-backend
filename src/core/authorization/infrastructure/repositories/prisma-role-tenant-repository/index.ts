import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "@/prisma/index";
import { TransactionContext } from "@/shared/transaction";

import type { Role } from "../../../domain/entities";
import { RoleTenantRepository } from "../../../domain/interfaces";
import { RoleMapper } from "../../mappers";

@Injectable()
export class PrismaRoleTenantRepository extends RoleTenantRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    public async associateRoles(roleIds: string[], tenantId: string, context: TransactionContext): Promise<void> {
        const prisma = context.get<Prisma.TransactionClient>();
        await prisma.roleTenant.createMany({
            data: roleIds.map((roleId) => ({ roleId, tenantId })),
            skipDuplicates: true,
        });
    }

    public async disassociateRoles(roleIds: string[], tenantId: string, context: TransactionContext): Promise<void> {
        const prisma = context.get<Prisma.TransactionClient>();
        await prisma.roleTenant.deleteMany({ where: { roleId: { in: roleIds }, tenantId } });
    }

    public async getRolesByTenant(tenantId: string): Promise<Role[]> {
        const roleTenants = await this.prisma.roleTenant.findMany({ where: { tenantId }, include: { role: true } });
        return roleTenants.map(({ role }) => RoleMapper.toDomain(role));
    }
}

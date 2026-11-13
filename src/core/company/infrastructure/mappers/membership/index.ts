import { type Membership as PrismaMembership } from "@prisma/client";

import { Membership } from "../../../domain/entities";

export class MembershipMapper {
    public static toPersistence(membership: Membership) {
        return {
            id: membership.id,
            tenantId: membership.tenantId,
            userId: membership.userId,
            companyId: membership.companyId,
            roleId: membership.roleId,
            status: membership.status,
            createdAt: membership.createdAt,
            updatedAt: membership.updatedAt,
        };
    }

    public static toDomain(prismaMembership: PrismaMembership): Membership {
        return Membership.restore({
            id: prismaMembership.id,
            tenantId: prismaMembership.tenantId,
            userId: prismaMembership.userId,
            companyId: prismaMembership.companyId,
            roleId: prismaMembership.roleId,
            status: prismaMembership.status,
            createdAt: prismaMembership.createdAt,
            updatedAt: prismaMembership.updatedAt,
        });
    }
}

import type { Role as PrismaRole } from "@prisma/client";

import { Role } from "../../../domain/entities";

export class RoleMapper {
    public static toPersistence(role: Role) {
        return {
            id: role.id,
            code: role.code,
            defaultDisplayName: role.defaultDisplayName,
            description: role.description,
            createdAt: role.createdAt,
            updatedAt: role.updatedAt,
        };
    }

    public static toDomain(role: PrismaRole): Role {
        return Role.restore({
            id: role.id,
            code: role.code,
            defaultDisplayName: role.defaultDisplayName,
            description: role.description,
            permissionIds: [],
            createdAt: role.createdAt,
            updatedAt: role.updatedAt,
        });
    }
}

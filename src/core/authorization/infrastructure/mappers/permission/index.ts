import type { Permission as PrismaPermission } from "@prisma/client";

import { Permission } from "../../../domain/entities";

export class PermissionMapper {
    public static toPersistence(permission: Permission) {
        return {
            id: permission.id,
            code: permission.code,
            description: permission.description,
            scope: permission.scope,
            createdAt: permission.createdAt,
            updatedAt: permission.updatedAt,
        };
    }

    public static toDomain(permission: PrismaPermission): Permission {
        return Permission.restore({
            id: permission.id,
            code: permission.code,
            description: permission.description,
            scope: permission.scope,
            createdAt: permission.createdAt,
            updatedAt: permission.updatedAt,
        });
    }
}

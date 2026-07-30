import type { User as PrismaUser } from "@prisma/client";

import { User } from "../../../domain/entities";
import { Email } from "../../../domain/value-objects";

export class UserMapper {
    public static toPersistence(user: User) {
        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email.value,
            tenantId: user.tenantId,
            roleId: user.roleId,
            status: user.status,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            suspendedAt: user.suspendedAt,
        };
    }

    public static toDomain(user: PrismaUser): User {
        return User.restore({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: Email.create(user.email),
            tenantId: user.tenantId,
            roleId: user.roleId,
            status: user.status,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            suspendedAt: user.suspendedAt,
        });
    }
}

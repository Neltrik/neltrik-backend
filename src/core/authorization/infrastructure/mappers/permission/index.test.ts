import type { Permission as PrismaPermission } from "@prisma/client";

import { Permission } from "../../../domain/entities";
import type { PermissionProps } from "../../../domain/types";
import { PermissionMapper } from "./index";

const createProps = (): PermissionProps => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    return {
        id: "permission-id",
        code: "USER_CREATE",
        description: "Allows creating users.",
        createdAt,
        updatedAt: createdAt,
    };
};

describe("PermissionMapper", () => {
    it("should map a domain permission to persistence", () => {
        const permission = Permission.restore(createProps());
        const persistence = PermissionMapper.toPersistence(permission);
        expect(persistence).toEqual({
            id: permission.id,
            code: permission.code,
            description: permission.description,
            createdAt: permission.createdAt,
            updatedAt: permission.updatedAt,
        });
    });

    it("should map a persistence permission to domain", () => {
        const props = createProps();
        const persistence: PrismaPermission = { ...props };
        const permission = PermissionMapper.toDomain(persistence);
        expect(permission).toBeInstanceOf(Permission);
        expect(permission.id).toBe(persistence.id);
        expect(permission.code).toBe(persistence.code);
        expect(permission.description).toBe(persistence.description);
        expect(permission.createdAt).toEqual(persistence.createdAt);
        expect(permission.updatedAt).toEqual(persistence.updatedAt);
    });
});

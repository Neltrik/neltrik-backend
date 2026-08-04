import type { Role as PrismaRole } from "@prisma/client";

import { Role } from "../../../domain/entities";
import type { RoleProps } from "../../../domain/types";
import { RoleMapper } from "./index";

const createProps = (): RoleProps => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    return {
        id: "role-id",
        code: "TENANT_ADMIN",
        defaultDisplayName: "Tenant Admin",
        description: "Administrator of a tenant.",
        createdAt,
        updatedAt: createdAt,
    };
};

describe("RoleMapper", () => {
    it("should map a domain role to persistence", () => {
        const role = Role.restore(createProps());
        const persistence = RoleMapper.toPersistence(role);
        expect(persistence).toEqual({
            id: role.id,
            code: role.code,
            defaultDisplayName: role.defaultDisplayName,
            description: role.description,
            createdAt: role.createdAt,
            updatedAt: role.updatedAt,
        });
    });

    it("should map a persistence role to domain", () => {
        const props = createProps();
        const persistence: PrismaRole = { ...props };
        const role = RoleMapper.toDomain(persistence);
        expect(role).toBeInstanceOf(Role);
        expect(role.id).toBe(persistence.id);
        expect(role.code).toBe(persistence.code);
        expect(role.defaultDisplayName).toBe(persistence.defaultDisplayName);
        expect(role.description).toBe(persistence.description);
        expect(role.createdAt).toEqual(persistence.createdAt);
        expect(role.updatedAt).toEqual(persistence.updatedAt);
    });
});

import type { User as PrismaUser } from "@prisma/client";

import { User } from "../../../domain/entities";
import { USER_STATUS, type UserState } from "../../../domain/types";
import { Email } from "../../../domain/value-objects/email";
import { UserMapper } from "./index";

const createProps = (): UserState => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    return {
        id: "user-id",
        firstName: "Omar",
        lastName: "Vargas",
        email: Email.create("omar@gmail.com"),
        tenantId: "tenant-id",
        roleId: "role-id",
        status: USER_STATUS.ACTIVE,
        createdAt,
        updatedAt: createdAt,
        suspendedAt: null,
    };
};

describe("UserMapper", () => {
    it("should map a domain user to persistence", () => {
        const user = User.restore(createProps());
        const persistence = UserMapper.toPersistence(user);
        expect(persistence).toEqual({
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
        });
    });

    it("should map a persistence user to domain", () => {
        const props = createProps();
        const persistence: PrismaUser = { ...props, email: props.email.value };
        const user = UserMapper.toDomain(persistence);
        expect(user).toBeInstanceOf(User);
        expect(user.id).toBe(persistence.id);
        expect(user.firstName).toBe(persistence.firstName);
        expect(user.lastName).toBe(persistence.lastName);
        expect(user.email.value).toBe(persistence.email);
        expect(user.tenantId).toBe(persistence.tenantId);
        expect(user.roleId).toBe(persistence.roleId);
        expect(user.status).toBe(persistence.status);
        expect(user.createdAt).toEqual(persistence.createdAt);
        expect(user.updatedAt).toEqual(persistence.updatedAt);
        expect(user.suspendedAt).toBeNull();
    });

    it("should preserve suspendedAt when mapping to domain", () => {
        const suspendedAt = new Date("2025-02-01T00:00:00.000Z");
        const props = createProps();
        const persistence: PrismaUser = {
            ...props,
            email: props.email.value,
            status: USER_STATUS.SUSPENDED,
            suspendedAt,
        };
        const user = UserMapper.toDomain(persistence);
        expect(user.status).toBe(USER_STATUS.SUSPENDED);
        expect(user.suspendedAt).toEqual(suspendedAt);
    });
});

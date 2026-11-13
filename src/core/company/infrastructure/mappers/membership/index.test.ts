import type { Membership as PrismaMembership } from "@prisma/client";

import { Membership } from "../../../domain/entities";
import { MEMBERSHIP_STATUS, type MembershipProps } from "../../../domain/types";
import { MembershipMapper } from "./index";

const createProps = (): MembershipProps => {
    const createdAt = new Date("2026-01-15T10:30:00.000Z");
    const updatedAt = new Date("2026-01-15T11:30:00.000Z");
    return {
        id: "membership-id",
        tenantId: "tenant-id",
        userId: "user-id",
        companyId: "company-id",
        roleId: "role-id",
        status: MEMBERSHIP_STATUS.ACTIVE,
        createdAt,
        updatedAt,
    };
};

describe("MembershipMapper", () => {
    it("should map a domain membership to persistence", () => {
        const membership = Membership.restore(createProps());
        const persistence = MembershipMapper.toPersistence(membership);
        expect(persistence).toEqual({
            id: membership.id,
            tenantId: membership.tenantId,
            userId: membership.userId,
            companyId: membership.companyId,
            roleId: membership.roleId,
            status: membership.status,
            createdAt: membership.createdAt,
            updatedAt: membership.updatedAt,
        });
    });

    it("should preserve all membership properties when mapping to persistence", () => {
        const membership = Membership.restore(createProps());
        const persistence = MembershipMapper.toPersistence(membership);
        expect(persistence.id).toBe(membership.id);
        expect(persistence.tenantId).toBe(membership.tenantId);
        expect(persistence.userId).toBe(membership.userId);
        expect(persistence.companyId).toBe(membership.companyId);
        expect(persistence.roleId).toBe(membership.roleId);
        expect(persistence.status).toBe(membership.status);
    });

    it("should preserve dates when mapping a domain membership to persistence", () => {
        const props = createProps();
        const membership = Membership.restore(props);
        const persistence = MembershipMapper.toPersistence(membership);
        expect(persistence.createdAt).toBe(props.createdAt);
        expect(persistence.updatedAt).toBe(props.updatedAt);
    });

    it("should map a persistence membership to domain", () => {
        const props = createProps();
        const persistence = { ...props };
        const membership = MembershipMapper.toDomain(persistence);
        expect(membership).toBeInstanceOf(Membership);
        expect(membership.id).toBe(persistence.id);
        expect(membership.tenantId).toBe(persistence.tenantId);
        expect(membership.userId).toBe(persistence.userId);
        expect(membership.companyId).toBe(persistence.companyId);
        expect(membership.roleId).toBe(persistence.roleId);
        expect(membership.status).toBe(persistence.status);
        expect(membership.createdAt).toEqual(persistence.createdAt);
        expect(membership.updatedAt).toEqual(persistence.updatedAt);
    });

    it("should map persistence values correctly when mapping to domain", () => {
        const persistence = {
            ...createProps(),
            roleId: "new-role-id",
            status: MEMBERSHIP_STATUS.SUSPENDED,
        } as PrismaMembership;
        const membership = MembershipMapper.toDomain(persistence);
        expect(membership.roleId).toBe("new-role-id");
        expect(membership.status).toBe(MEMBERSHIP_STATUS.SUSPENDED);
    });

    it("should preserve dates when mapping a persistence membership to domain", () => {
        const props = createProps();
        const membership = MembershipMapper.toDomain({ ...props });
        expect(membership.createdAt).toEqual(props.createdAt);
        expect(membership.updatedAt).toEqual(props.updatedAt);
    });

    it("should map a pending membership from persistence to domain", () => {
        const persistence = { ...createProps(), status: MEMBERSHIP_STATUS.PENDING } as PrismaMembership;
        const membership = MembershipMapper.toDomain(persistence);
        expect(membership.isPending()).toBe(true);
        expect(membership.isActive()).toBe(false);
    });

    it("should map an active membership from persistence to domain", () => {
        const persistence = { ...createProps(), status: MEMBERSHIP_STATUS.ACTIVE } as PrismaMembership;
        const membership = MembershipMapper.toDomain(persistence);
        expect(membership.isActive()).toBe(true);
        expect(membership.isSuspended()).toBe(false);
    });

    it("should map a suspended membership from persistence to domain", () => {
        const persistence = { ...createProps(), status: MEMBERSHIP_STATUS.SUSPENDED } as PrismaMembership;
        const membership = MembershipMapper.toDomain(persistence);
        expect(membership.isSuspended()).toBe(true);
        expect(membership.isActive()).toBe(false);
    });

    it("should map a revoked membership from persistence to domain", () => {
        const persistence = { ...createProps(), status: MEMBERSHIP_STATUS.REVOKED } as PrismaMembership;
        const membership = MembershipMapper.toDomain(persistence);
        expect(membership.isRevoked()).toBe(true);
        expect(membership.canBeRevoked()).toBe(false);
    });
});

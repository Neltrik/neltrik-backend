import {
    InvalidMembershipStatusError,
    InvalidMembershipTransitionError,
    MembershipAlreadyRevokedError,
} from "../../errors";
import { MEMBERSHIP_STATUS, type MembershipProps, type MembershipStatus } from "../../types";
import { Membership } from "./index";

const createProps = (): MembershipProps => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    return {
        id: "membership-id",
        tenantId: "tenant-id",
        userId: "user-id",
        companyId: "company-id",
        roleId: "role-id",
        status: MEMBERSHIP_STATUS.PENDING,
        createdAt,
        updatedAt: createdAt,
    };
};

describe("Membership", () => {
    it("should create a membership", () => {
        const props = createProps();
        const { status: _status, updatedAt: _updatedAt, ...restProps } = props;
        const membership = Membership.create(restProps);
        expect(membership.id).toBe(props.id);
        expect(membership.tenantId).toBe(props.tenantId);
        expect(membership.userId).toBe(props.userId);
        expect(membership.companyId).toBe(props.companyId);
        expect(membership.roleId).toBe(props.roleId);
        expect(membership.status).toBe(MEMBERSHIP_STATUS.PENDING);
        expect(membership.createdAt).toBe(props.createdAt);
        expect(membership.updatedAt).toBe(props.createdAt);
    });

    it("should restore a membership and expose all properties", () => {
        const props = createProps();
        const membership = Membership.restore(props);
        expect(membership.id).toBe(props.id);
        expect(membership.tenantId).toBe(props.tenantId);
        expect(membership.userId).toBe(props.userId);
        expect(membership.companyId).toBe(props.companyId);
        expect(membership.roleId).toBe(props.roleId);
        expect(membership.status).toBe(props.status);
        expect(membership.createdAt).toBe(props.createdAt);
        expect(membership.updatedAt).toBe(props.updatedAt);
    });
});

describe("Validations", () => {
    it("should throw InvalidMembershipStatusError when status is invalid", () => {
        const invalidStatus = "INVALID_STATUS" as unknown as MembershipStatus;
        expect(() => Membership.restore({ ...createProps(), status: invalidStatus })).toThrow(
            InvalidMembershipStatusError,
        );
    });
});

describe("Mutations & State Transitions", () => {
    it("should accept a pending membership", () => {
        const membership = Membership.restore(createProps());
        membership.accept();
        expect(membership.status).toBe(MEMBERSHIP_STATUS.ACTIVE);
        expect(membership.updatedAt.getTime()).toBeGreaterThanOrEqual(createProps().updatedAt.getTime());
    });

    it("should suspend an active membership", () => {
        const membership = Membership.restore({ ...createProps(), status: MEMBERSHIP_STATUS.ACTIVE });
        membership.suspend();
        expect(membership.status).toBe(MEMBERSHIP_STATUS.SUSPENDED);
        expect(membership.updatedAt).toBeInstanceOf(Date);
    });

    it("should reactivate a suspended membership", () => {
        const membership = Membership.restore({ ...createProps(), status: MEMBERSHIP_STATUS.SUSPENDED });
        membership.reactivate();
        expect(membership.status).toBe(MEMBERSHIP_STATUS.ACTIVE);
        expect(membership.updatedAt).toBeInstanceOf(Date);
    });

    it("should revoke a membership", () => {
        const membership = Membership.restore(createProps());
        membership.revoke();
        expect(membership.status).toBe(MEMBERSHIP_STATUS.REVOKED);
        expect(membership.updatedAt).toBeInstanceOf(Date);
    });

    it("should throw InvalidMembershipTransitionError for invalid transitions", () => {
        const cases = [
            [MEMBERSHIP_STATUS.ACTIVE, (m: Membership) => m.accept()],
            [MEMBERSHIP_STATUS.PENDING, (m: Membership) => m.suspend()],
            [MEMBERSHIP_STATUS.ACTIVE, (m: Membership) => m.reactivate()],
            [MEMBERSHIP_STATUS.REVOKED, (m: Membership) => m.accept()],
        ] as const;
        cases.forEach(([status, action]) => {
            const membership = Membership.restore({ ...createProps(), status });
            expect(() => action(membership)).toThrow(InvalidMembershipTransitionError);
        });
    });

    it("should throw MembershipAlreadyRevokedError when revoking an already revoked membership", () => {
        const membership = Membership.restore({ ...createProps(), status: MEMBERSHIP_STATUS.REVOKED });
        expect(() => membership.revoke()).toThrow(MembershipAlreadyRevokedError);
    });

    it("should change role when membership is active", () => {
        const membership = Membership.restore({ ...createProps(), status: MEMBERSHIP_STATUS.ACTIVE });
        membership.changeRole("new-role-id");
        expect(membership.roleId).toBe("new-role-id");
        expect(membership.updatedAt).toBeInstanceOf(Date);
    });

    it("should throw InvalidMembershipTransitionError when changing role in a non-active membership", () => {
        [MEMBERSHIP_STATUS.PENDING, MEMBERSHIP_STATUS.SUSPENDED, MEMBERSHIP_STATUS.REVOKED].forEach((status) => {
            const membership = Membership.restore({ ...createProps(), status });
            expect(() => membership.changeRole("new-role-id")).toThrow(InvalidMembershipTransitionError);
        });
    });
});

describe("Membership helpers", () => {
    it("should identify membership statuses correctly", () => {
        const cases = [
            [MEMBERSHIP_STATUS.PENDING, true, false, false, false],
            [MEMBERSHIP_STATUS.ACTIVE, false, true, false, false],
            [MEMBERSHIP_STATUS.SUSPENDED, false, false, true, false],
            [MEMBERSHIP_STATUS.REVOKED, false, false, false, true],
        ] as const;
        cases.forEach(([status, pending, active, suspended, revoked]) => {
            const membership = Membership.restore({ ...createProps(), status });
            expect(membership.isPending()).toBe(pending);
            expect(membership.isActive()).toBe(active);
            expect(membership.isSuspended()).toBe(suspended);
            expect(membership.isRevoked()).toBe(revoked);
        });
    });

    it("should expose allowed operations according to membership status", () => {
        const cases = [
            [MEMBERSHIP_STATUS.PENDING, true, false, false, true, false],
            [MEMBERSHIP_STATUS.ACTIVE, false, true, false, true, true],
            [MEMBERSHIP_STATUS.SUSPENDED, false, false, true, true, false],
            [MEMBERSHIP_STATUS.REVOKED, false, false, false, false, false],
        ] as const;
        cases.forEach(([status, accept, suspend, reactivate, revoke, changeRole]) => {
            const membership = Membership.restore({ ...createProps(), status });
            expect(membership.canBeAccepted()).toBe(accept);
            expect(membership.canBeSuspended()).toBe(suspend);
            expect(membership.canBeReactivated()).toBe(reactivate);
            expect(membership.canBeRevoked()).toBe(revoke);
            expect(membership.canChangeRole()).toBe(changeRole);
        });
    });
});

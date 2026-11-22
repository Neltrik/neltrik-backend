import { MEMBERSHIP_STATUSES } from "../../../domain/types/membership";
import {
    acceptInvitationParamsSchema,
    getMembershipParamsSchema,
    inviteMemberSchema,
    listMembersQuerySchema,
    listMyMembershipsQuerySchema,
    reactivateMemberParamsSchema,
    revokeMemberParamsSchema,
    suspendMemberParamsSchema,
    updateMemberRoleParamsSchema,
    updateMemberRoleSchema,
} from "./";

const validId = "550e8400-e29b-41d4-a716-446655440000";

describe("inviteMemberSchema", () => {
    it("should validate a correct invitation", () => {
        expect(inviteMemberSchema.safeParse({ userId: validId, roleId: validId }).success).toBe(true);
    });

    it("should reject an invalid user ID", () => {
        expect(inviteMemberSchema.safeParse({ userId: "invalid-id", roleId: validId }).success).toBe(false);
    });

    it("should reject an invalid role ID", () => {
        expect(inviteMemberSchema.safeParse({ userId: validId, roleId: "invalid-id" }).success).toBe(false);
    });

    it("should reject a missing user ID", () => {
        expect(inviteMemberSchema.safeParse({ roleId: validId }).success).toBe(false);
    });

    it("should reject a missing role ID", () => {
        expect(inviteMemberSchema.safeParse({ userId: validId }).success).toBe(false);
    });

    it("should reject non-string values", () => {
        expect(inviteMemberSchema.safeParse({ userId: 123, roleId: validId }).success).toBe(false);
        expect(inviteMemberSchema.safeParse({ userId: validId, roleId: 123 }).success).toBe(false);
    });
});

describe("listMyMembershipsQuerySchema", () => {
    it("should accept an empty query and coerce limit to a number", () => {
        expect(listMyMembershipsQuerySchema.safeParse({}).success).toBe(true);
        expect(listMyMembershipsQuerySchema.safeParse({ limit: "10" }).success).toBe(true);
    });

    it("should accept a valid membership status", () => {
        MEMBERSHIP_STATUSES.forEach((status) => {
            expect(listMyMembershipsQuerySchema.safeParse({ status }).success).toBe(true);
        });
    });

    it("should accept an undefined status", () => {
        expect(listMyMembershipsQuerySchema.safeParse({ status: undefined }).success).toBe(true);
    });

    it("should reject an invalid membership status", () => {
        expect(listMyMembershipsQuerySchema.safeParse({ status: "INVALID_STATUS" }).success).toBe(false);
    });

    it.each([0, -1, 101, 1.5, "invalid"])("should reject limit %s", (limit) => {
        expect(listMyMembershipsQuerySchema.safeParse({ limit }).success).toBe(false);
    });
});

describe("acceptInvitationParamsSchema", () => {
    it("should validate a correct invitation ID", () => {
        expect(acceptInvitationParamsSchema.safeParse({ id: validId }).success).toBe(true);
    });

    it.each(["invalid", "", "123", "550e8400-e29b-41d4-a716"])("should reject an invalid invitation ID: %s", (id) => {
        expect(acceptInvitationParamsSchema.safeParse({ id }).success).toBe(false);
    });

    it("should reject a missing ID", () => {
        expect(acceptInvitationParamsSchema.safeParse({}).success).toBe(false);
    });

    it("should reject a non-string ID", () => {
        expect(acceptInvitationParamsSchema.safeParse({ id: 123 }).success).toBe(false);
    });
});

describe("listMembersQuerySchema", () => {
    it("should accept an empty query and coerce limit to a number", () => {
        expect(listMembersQuerySchema.safeParse({}).success).toBe(true);
        expect(listMembersQuerySchema.safeParse({ limit: "10" }).success).toBe(true);
    });

    it.each([0, -1, 101, 1.5, "invalid"])("should reject limit %s", (limit) => {
        expect(listMembersQuerySchema.safeParse({ limit }).success).toBe(false);
    });
});

describe("getMembershipParamsSchema", () => {
    it("should validate a correct membership ID", () => {
        expect(getMembershipParamsSchema.safeParse({ id: validId }).success).toBe(true);
    });

    it.each(["invalid", "", "123", "550e8400-e29b-41d4-a716"])("should reject an invalid membership ID: %s", (id) => {
        expect(getMembershipParamsSchema.safeParse({ id }).success).toBe(false);
    });

    it("should reject a missing ID", () => {
        expect(getMembershipParamsSchema.safeParse({}).success).toBe(false);
    });

    it("should reject a non-string ID", () => {
        expect(getMembershipParamsSchema.safeParse({ id: 123 }).success).toBe(false);
    });
});

describe("updateMemberRoleParamsSchema", () => {
    it("should validate a correct membership ID", () => {
        expect(updateMemberRoleParamsSchema.safeParse({ id: validId }).success).toBe(true);
    });

    it.each(["invalid", "", "123", "550e8400-e29b-41d4-a716"])("should reject an invalid membership ID: %s", (id) => {
        expect(updateMemberRoleParamsSchema.safeParse({ id }).success).toBe(false);
    });

    it("should reject a missing ID", () => {
        expect(updateMemberRoleParamsSchema.safeParse({}).success).toBe(false);
    });

    it("should reject a non-string ID", () => {
        expect(updateMemberRoleParamsSchema.safeParse({ id: 123 }).success).toBe(false);
    });
});

describe("updateMemberRoleSchema", () => {
    it("should validate a correct role ID", () => {
        expect(updateMemberRoleSchema.safeParse({ roleId: validId }).success).toBe(true);
    });

    it.each(["invalid", "", "123", "550e8400-e29b-41d4-a716"])("should reject an invalid role ID: %s", (roleId) => {
        expect(updateMemberRoleSchema.safeParse({ roleId }).success).toBe(false);
    });

    it("should reject a missing role ID", () => {
        expect(updateMemberRoleSchema.safeParse({}).success).toBe(false);
    });

    it("should reject a non-string role ID", () => {
        expect(updateMemberRoleSchema.safeParse({ roleId: 123 }).success).toBe(false);
    });
});

describe("suspendMemberParamsSchema", () => {
    it("should validate a correct membership ID", () => {
        expect(suspendMemberParamsSchema.safeParse({ id: validId }).success).toBe(true);
    });

    it.each(["invalid", "", "123", "550e8400-e29b-41d4-a716"])("should reject an invalid membership ID: %s", (id) => {
        expect(suspendMemberParamsSchema.safeParse({ id }).success).toBe(false);
    });

    it("should reject a missing ID", () => {
        expect(suspendMemberParamsSchema.safeParse({}).success).toBe(false);
    });

    it("should reject a non-string ID", () => {
        expect(suspendMemberParamsSchema.safeParse({ id: 123 }).success).toBe(false);
    });
});

describe("reactivateMemberParamsSchema", () => {
    it("should validate a correct membership ID", () => {
        expect(reactivateMemberParamsSchema.safeParse({ id: validId }).success).toBe(true);
    });

    it.each(["invalid", "", "123", "550e8400-e29b-41d4-a716"])("should reject an invalid membership ID: %s", (id) => {
        expect(reactivateMemberParamsSchema.safeParse({ id }).success).toBe(false);
    });

    it("should reject a missing ID", () => {
        expect(reactivateMemberParamsSchema.safeParse({}).success).toBe(false);
    });

    it("should reject a non-string ID", () => {
        expect(reactivateMemberParamsSchema.safeParse({ id: 123 }).success).toBe(false);
    });
});

describe("revokeMemberParamsSchema", () => {
    it("should validate a correct membership ID", () => {
        expect(revokeMemberParamsSchema.safeParse({ id: validId }).success).toBe(true);
    });

    it.each(["invalid", "", "123", "550e8400-e29b-41d4-a716"])("should reject an invalid membership ID: %s", (id) => {
        expect(revokeMemberParamsSchema.safeParse({ id }).success).toBe(false);
    });

    it("should reject a missing ID", () => {
        expect(revokeMemberParamsSchema.safeParse({}).success).toBe(false);
    });

    it("should reject a non-string ID", () => {
        expect(revokeMemberParamsSchema.safeParse({ id: 123 }).success).toBe(false);
    });
});

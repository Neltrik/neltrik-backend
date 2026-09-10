import {
    changeRoleUserParamsSchema,
    changeRoleUserSchema,
    reactivateUserParamsSchema,
    suspendUserParamsSchema,
} from "./";

describe("changeRoleUserParamsSchema", () => {
    it("should accept a valid UUID", () => {
        const result = changeRoleUserParamsSchema.safeParse({
            id: "550e8400-e29b-41d4-a716-446655440000",
        });
        expect(result.success).toBe(true);
    });

    it("should reject when id is not provided", () => {
        const result = changeRoleUserParamsSchema.safeParse({});
        expect(result.success).toBe(false);
    });

    it("should reject when id is not a valid UUID", () => {
        const result = changeRoleUserParamsSchema.safeParse({
            id: "invalid-id",
        });
        expect(result.success).toBe(false);
    });
});

describe("changeRoleUserSchema", () => {
    it("should accept a valid roleId", () => {
        const result = changeRoleUserSchema.safeParse({
            roleId: "550e8400-e29b-41d4-a716-446655440000",
        });
        expect(result.success).toBe(true);
    });

    it("should reject when roleId is not provided", () => {
        const result = changeRoleUserSchema.safeParse({});
        expect(result.success).toBe(false);
    });

    it("should reject when roleId is not a valid UUID", () => {
        const result = changeRoleUserSchema.safeParse({
            roleId: "invalid-role-id",
        });
        expect(result.success).toBe(false);
    });
});

describe("suspendUserParamsSchema", () => {
    it("should accept a valid UUID", () => {
        const result = suspendUserParamsSchema.safeParse({
            id: "550e8400-e29b-41d4-a716-446655440000",
        });
        expect(result.success).toBe(true);
    });

    it("should reject when id is not provided", () => {
        const result = suspendUserParamsSchema.safeParse({});
        expect(result.success).toBe(false);
    });

    it("should reject when id is not a valid UUID", () => {
        const result = suspendUserParamsSchema.safeParse({
            id: "invalid-id",
        });
        expect(result.success).toBe(false);
    });
});

describe("reactivateUserParamsSchema", () => {
    it("should accept a valid UUID", () => {
        const result = reactivateUserParamsSchema.safeParse({
            id: "550e8400-e29b-41d4-a716-446655440000",
        });
        expect(result.success).toBe(true);
    });

    it("should reject when id is not provided", () => {
        const result = reactivateUserParamsSchema.safeParse({});
        expect(result.success).toBe(false);
    });

    it("should reject when id is not a valid UUID", () => {
        const result = reactivateUserParamsSchema.safeParse({
            id: "invalid-id",
        });
        expect(result.success).toBe(false);
    });
});

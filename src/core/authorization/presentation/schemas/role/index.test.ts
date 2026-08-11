import {
    assignPermissionsToRoleSchema,
    createRoleSchema,
    removePermissionsFromRoleSchema,
    roleParamsSchema,
    rolePermissionParamsSchema,
    updateRoleSchema,
} from "./";

describe("createRoleSchema", () => {
    const makeInput = () => ({
        code: "TENANT_ADMIN",
        defaultDisplayName: "Tenant Administrator",
        description: "Tenant administrator role.",
        scope: "PLATFORM",
    });

    it("should validate a valid request", () => {
        expect(() => createRoleSchema.parse(makeInput())).not.toThrow();
    });

    it("should reject empty code", () => {
        expect(() => createRoleSchema.parse({ ...makeInput(), code: "" })).toThrow();
    });

    it("should reject empty defaultDisplayName", () => {
        expect(() => createRoleSchema.parse({ ...makeInput(), defaultDisplayName: "" })).toThrow();
    });

    it("should reject empty description", () => {
        expect(() => createRoleSchema.parse({ ...makeInput(), description: "" })).toThrow();
    });
});

describe("updateRoleSchema", () => {
    it("should reject when no fields are provided", () => {
        const result = updateRoleSchema.safeParse({});
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues).toHaveLength(1);
            expect(result.error.issues[0]?.message).toBe("At least one field must be provided.");
        }
    });
});

describe("roleParamsSchema", () => {
    it("should validate a valid role id", () => {
        expect(() => roleParamsSchema.parse({ id: "550e8400-e29b-41d4-a716-446655440000" })).not.toThrow();
    });

    it("should reject an invalid role id", () => {
        expect(() => roleParamsSchema.parse({ id: "invalid-id" })).toThrow();
    });
});

describe("assignPermissionsToRoleSchema", () => {
    const makeInput = () => ({
        permissionIds: ["550e8400-e29b-41d4-a716-446655440000", "6ba7b810-9dad-41d1-80b4-00c04fd430c8"],
    });

    it("should validate a valid request", () => {
        expect(() => assignPermissionsToRoleSchema.parse(makeInput())).not.toThrow();
    });

    it("should validate a single permission", () => {
        expect(() =>
            assignPermissionsToRoleSchema.parse({
                permissionIds: ["550e8400-e29b-41d4-a716-446655440000"],
            }),
        ).not.toThrow();
    });

    it("should reject an empty permissionIds array", () => {
        expect(() => assignPermissionsToRoleSchema.parse({ permissionIds: [] })).toThrow();
    });

    it("should reject an invalid permission id", () => {
        expect(() => assignPermissionsToRoleSchema.parse({ permissionIds: ["invalid-id"] })).toThrow();
    });

    it("should reject more than 100 permissions", () => {
        const permissionIds = Array.from(
            { length: 101 },
            (_, index) => `550e8400-e29b-41d4-a716-4466${index.toString().padStart(2, "0")}`,
        );
        const result = assignPermissionsToRoleSchema.safeParse({ permissionIds });
        expect(result.success).toBe(false);
    });
});

describe("removePermissionsFromRoleSchema", () => {
    const makeInput = () => ({
        permissionIds: ["550e8400-e29b-41d4-a716-446655440000", "6ba7b810-9dad-41d1-80b4-00c04fd430c8"],
    });

    it("should validate a valid request", () => {
        expect(() => removePermissionsFromRoleSchema.parse(makeInput())).not.toThrow();
    });

    it("should validate a single permission", () => {
        expect(() =>
            removePermissionsFromRoleSchema.parse({
                permissionIds: ["550e8400-e29b-41d4-a716-446655440000"],
            }),
        ).not.toThrow();
    });

    it("should reject an empty permissionIds array", () => {
        expect(() => removePermissionsFromRoleSchema.parse({ permissionIds: [] })).toThrow();
    });

    it("should reject an invalid permission id", () => {
        expect(() => removePermissionsFromRoleSchema.parse({ permissionIds: ["invalid-id"] })).toThrow();
    });

    it("should reject more than 100 permissions", () => {
        const permissionIds = Array.from(
            { length: 101 },
            (_, index) => `550e8400-e29b-41d4-a716-4466${index.toString().padStart(2, "0")}`,
        );
        const result = removePermissionsFromRoleSchema.safeParse({ permissionIds });
        expect(result.success).toBe(false);
    });
});

describe("rolePermissionParamsSchema", () => {
    it("should validate a valid role id", () => {
        expect(() =>
            rolePermissionParamsSchema.parse({
                id: "550e8400-e29b-41d4-a716-446655440000",
            }),
        ).not.toThrow();
    });

    it("should reject an invalid role id", () => {
        expect(() => rolePermissionParamsSchema.parse({ id: "invalid-id" })).toThrow();
    });
});

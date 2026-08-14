import { createPermissionSchema, permissionParamsSchema, updatePermissionSchema } from "./";

describe("createPermissionSchema", () => {
    const makeInput = () => ({
        code: "USER_CREATE",
        description: "Allows creating users.",
        scope: "PLATFORM",
    });

    it("should validate a valid request", () => {
        expect(() => createPermissionSchema.parse(makeInput())).not.toThrow();
    });

    it("should reject empty code", () => {
        expect(() => createPermissionSchema.parse({ ...makeInput(), code: "" })).toThrow();
    });

    it("should reject code longer than 150 characters", () => {
        expect(() => createPermissionSchema.parse({ ...makeInput(), code: "A".repeat(151) })).toThrow();
    });

    it("should reject empty description", () => {
        expect(() => createPermissionSchema.parse({ ...makeInput(), description: "" })).toThrow();
    });
});

describe("updatePermissionSchema", () => {
    it("should validate a valid request", () => {
        expect(() => updatePermissionSchema.parse({ description: "Updated description." })).not.toThrow();
    });

    it("should reject empty description", () => {
        expect(() => updatePermissionSchema.parse({ description: "" })).toThrow();
    });

    it("should reject when no fields are provided", () => {
        const result = updatePermissionSchema.safeParse({});
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues).toHaveLength(1);
            expect(result.error.issues[0]?.message).toBe("At least one field must be provided.");
        }
    });
});

describe("permissionParamsSchema", () => {
    it("should validate a valid uuid", () => {
        expect(() => permissionParamsSchema.parse({ id: "550e8400-e29b-41d4-a716-446655440000" })).not.toThrow();
    });

    it("should reject an invalid uuid", () => {
        expect(() => permissionParamsSchema.parse({ id: "invalid-id" })).toThrow();
    });
});

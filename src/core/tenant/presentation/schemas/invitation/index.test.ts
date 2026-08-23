import {
    createInvitationSchema,
    listInvitationsParamsSchema,
    revokeInvitationParamsSchema,
    validateInvitationQuerySchema,
} from ".";

describe("createInvitationSchema", () => {
    const validPayload = {
        tenantId: "550e8400-e29b-41d4-a716-446655440000",
        roleId: "550e8400-e29b-41d4-a716-446655440001",
        recipient: "user@example.com",
        mechanism: "email",
    };

    it("should validate a correct payload", () => {
        const result = createInvitationSchema.safeParse(validPayload);
        expect(result.success).toBe(true);
    });

    it("should reject an invalid tenantId", () => {
        const result = createInvitationSchema.safeParse({ ...validPayload, tenantId: "invalid-id" });
        expect(result.success).toBe(false);
    });

    it("should reject an invalid roleId", () => {
        const result = createInvitationSchema.safeParse({ ...validPayload, roleId: "invalid-id" });
        expect(result.success).toBe(false);
    });

    it("should reject empty recipient", () => {
        const result = createInvitationSchema.safeParse({ ...validPayload, recipient: "" });
        expect(result.success).toBe(false);
    });

    it("should reject blank recipient", () => {
        const result = createInvitationSchema.safeParse({ ...validPayload, recipient: "   " });
        expect(result.success).toBe(false);
    });

    it("should reject recipient longer than 255 characters", () => {
        const result = createInvitationSchema.safeParse({ ...validPayload, recipient: "a".repeat(256) });
        expect(result.success).toBe(false);
    });

    it("should allow recipient with 255 characters", () => {
        const result = createInvitationSchema.safeParse({ ...validPayload, recipient: "a".repeat(255) });
        expect(result.success).toBe(true);
    });

    it("should reject empty mechanism", () => {
        const result = createInvitationSchema.safeParse({ ...validPayload, mechanism: "" });
        expect(result.success).toBe(false);
    });

    it("should reject blank mechanism", () => {
        const result = createInvitationSchema.safeParse({ ...validPayload, mechanism: "   " });
        expect(result.success).toBe(false);
    });

    it("should reject mechanism longer than 50 characters", () => {
        const result = createInvitationSchema.safeParse({ ...validPayload, mechanism: "a".repeat(51) });
        expect(result.success).toBe(false);
    });

    it("should allow mechanism with 50 characters", () => {
        const result = createInvitationSchema.safeParse({ ...validPayload, mechanism: "a".repeat(50) });
        expect(result.success).toBe(true);
    });
});

describe("validateInvitationQuerySchema", () => {
    it("should validate a correct token", () => {
        const result = validateInvitationQuerySchema.safeParse({ token: "valid-token" });
        expect(result.success).toBe(true);
    });

    it("should reject an empty token", () => {
        const result = validateInvitationQuerySchema.safeParse({ token: "" });
        expect(result.success).toBe(false);
    });

    it("should reject a blank token", () => {
        const result = validateInvitationQuerySchema.safeParse({ token: "   " });
        expect(result.success).toBe(false);
    });

    it("should reject a missing token", () => {
        const result = validateInvitationQuerySchema.safeParse({});
        expect(result.success).toBe(false);
    });
});

describe("revokeInvitationParamsSchema", () => {
    it("should validate a correct token", () => {
        const result = revokeInvitationParamsSchema.safeParse({ token: "valid-token" });
        expect(result.success).toBe(true);
    });

    it("should reject an empty token", () => {
        const result = revokeInvitationParamsSchema.safeParse({ token: "" });
        expect(result.success).toBe(false);
    });

    it("should reject a blank token", () => {
        const result = revokeInvitationParamsSchema.safeParse({ token: "   " });
        expect(result.success).toBe(false);
    });

    it("should reject a missing token", () => {
        const result = revokeInvitationParamsSchema.safeParse({});
        expect(result.success).toBe(false);
    });
});

describe("listInvitationsParamsSchema", () => {
    it("should validate a valid tenantId", () => {
        const result = listInvitationsParamsSchema.safeParse({
            tenantId: "550e8400-e29b-41d4-a716-446655440000",
        });
        expect(result.success).toBe(true);
    });

    it("should reject an invalid tenantId", () => {
        const result = listInvitationsParamsSchema.safeParse({
            tenantId: "invalid-id",
        });
        expect(result.success).toBe(false);
    });

    it("should reject a missing tenantId", () => {
        const result = listInvitationsParamsSchema.safeParse({});
        expect(result.success).toBe(false);
    });
});

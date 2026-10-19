import {
    activateNotificationTemplateParamsSchema,
    createNotificationTemplateSchema,
    deactivateNotificationTemplateParamsSchema,
    getNotificationTemplateParamsSchema,
    listNotificationTemplatesQuerySchema,
    updateNotificationTemplateParamsSchema,
    updateNotificationTemplateSchema,
} from "./";

const validId = "550e8400-e29b-41d4-a716-446655440000";

describe("createNotificationTemplateSchema", () => {
    const validPayload = {
        code: "WELCOME",
        channel: "EMAIL" as const,
        locale: "en",
        subject: "Welcome",
        body: "Welcome!",
        targetTenantId: validId,
    };

    it("should validate a correct payload", () => {
        expect(createNotificationTemplateSchema.safeParse(validPayload).success).toBe(true);
    });

    it.each([
        { code: "" },
        { code: "a".repeat(101) },
        { locale: "" },
        { locale: "a".repeat(11) },
        { subject: null },
        { subject: "" },
        { subject: "a".repeat(256) },
        { body: "" },
        { targetTenantId: "invalid-id" },
    ])("should reject invalid fields: %o", (payload) => {
        expect(createNotificationTemplateSchema.safeParse({ ...validPayload, ...payload }).success).toBe(false);
    });

    it("should accept a null targetTenantId", () => {
        expect(createNotificationTemplateSchema.safeParse({ ...validPayload, targetTenantId: null }).success).toBe(
            true,
        );
    });
});

describe("updateNotificationTemplateParamsSchema", () => {
    it("should validate a correct id", () => {
        expect(updateNotificationTemplateParamsSchema.safeParse({ id: validId }).success).toBe(true);
    });

    it("should reject an invalid id", () => {
        expect(updateNotificationTemplateParamsSchema.safeParse({ id: "invalid" }).success).toBe(false);
    });
});

describe("updateNotificationTemplateSchema", () => {
    it("should validate a correct payload", () => {
        expect(updateNotificationTemplateSchema.safeParse({ subject: "Welcome", body: "Hello" }).success).toBe(true);
    });

    it.each([
        { subject: "a".repeat(256), body: "Hello" },
        { subject: null, body: "" },
        { subject: "Welcome" },
        { body: "Hello" },
    ])("should reject an invalid payload: %o", (payload) => {
        expect(updateNotificationTemplateSchema.safeParse(payload).success).toBe(false);
    });
});

describe.each([
    ["activateNotificationTemplateParamsSchema", activateNotificationTemplateParamsSchema],
    ["deactivateNotificationTemplateParamsSchema", deactivateNotificationTemplateParamsSchema],
    ["getNotificationTemplateParamsSchema", getNotificationTemplateParamsSchema],
])("%s", (_name, schema) => {
    it("should validate a correct id", () => {
        expect(schema.safeParse({ id: validId }).success).toBe(true);
    });

    it("should reject an invalid id", () => {
        expect(schema.safeParse({ id: "invalid" }).success).toBe(false);
    });
});

describe("listNotificationTemplatesQuerySchema", () => {
    it("should accept an empty query and coerce limit to a number", () => {
        expect(listNotificationTemplatesQuerySchema.safeParse({}).success).toBe(true);
        expect(listNotificationTemplatesQuerySchema.safeParse({ limit: "10" }).success).toBe(true);
    });

    it.each([0, -1, 101, 1.5, "invalid"])("should reject limit %s", (limit) => {
        expect(listNotificationTemplatesQuerySchema.safeParse({ limit }).success).toBe(false);
    });
});

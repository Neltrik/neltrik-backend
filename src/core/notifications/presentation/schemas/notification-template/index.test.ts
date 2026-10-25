import { NOTIFICATION_CODES } from "../../../domain/catalogs";
import { NOTIFICATION_CHANNELS, NOTIFICATION_TEMPLATE_LOCALE_REGEX } from "../../../domain/types";
import {
    activateNotificationTemplateParamsSchema,
    createNotificationTemplateSchema,
    desactivateNotificationTemplateParamsSchema,
    getNotificationTemplateParamsSchema,
    listNotificationTemplatesQuerySchema,
    updateNotificationTemplateParamsSchema,
    updateNotificationTemplateSchema,
} from "./";

const validId = "550e8400-e29b-41d4-a716-446655440000";

describe("createNotificationTemplateSchema", () => {
    const validPayload = {
        code: Object.values(NOTIFICATION_CODES)[0],
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
        { code: "INVALID_CODE" },
        { channel: "INVALID_CHANNEL" },
        { locale: "" },
        { locale: "invalid_locale" },
        { subject: "a".repeat(256) },
        { body: "" },
        { targetTenantId: "invalid-id" },
    ])("should reject invalid fields: %o", (payload) => {
        expect(createNotificationTemplateSchema.safeParse({ ...validPayload, ...payload }).success).toBe(false);
    });

    it("should reject a null subject when channel is EMAIL", () => {
        expect(createNotificationTemplateSchema.safeParse({ ...validPayload, subject: null }).success).toBe(false);
    });

    it("should reject an empty subject when channel is EMAIL", () => {
        expect(createNotificationTemplateSchema.safeParse({ ...validPayload, subject: "" }).success).toBe(false);
    });

    it("should accept a null targetTenantId", () => {
        expect(createNotificationTemplateSchema.safeParse({ ...validPayload, targetTenantId: null }).success).toBe(
            true,
        );
    });

    it("should accept a valid locale", () => {
        const locale = NOTIFICATION_TEMPLATE_LOCALE_REGEX.test("en") ? "en" : "es-CO";
        expect(createNotificationTemplateSchema.safeParse({ ...validPayload, locale }).success).toBe(true);
    });

    it("should accept a null subject for a non-EMAIL channel", () => {
        const channel = Object.values(NOTIFICATION_CHANNELS).find((value) => value !== "EMAIL");
        if (channel === undefined) {
            return;
        }
        expect(createNotificationTemplateSchema.safeParse({ ...validPayload, channel, subject: null }).success).toBe(
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

    it("should accept a null subject", () => {
        expect(updateNotificationTemplateSchema.safeParse({ subject: null, body: "Hello" }).success).toBe(true);
    });
});

describe.each([
    ["activateNotificationTemplateParamsSchema", activateNotificationTemplateParamsSchema],
    ["desactivateNotificationTemplateParamsSchema", desactivateNotificationTemplateParamsSchema],
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

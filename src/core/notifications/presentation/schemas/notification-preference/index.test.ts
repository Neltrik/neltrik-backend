import { NOTIFICATION_CATEGORIES, NOTIFICATION_CHANNELS } from "../../../domain/types";
import {
    createNotificationPreferenceSchema,
    listNotificationPreferencesQuerySchema,
    notificationPreferenceParamsSchema,
    updateNotificationPreferenceSchema,
} from "./";

const validId = "550e8400-e29b-41d4-a716-446655440000";

describe("notificationPreferenceParamsSchema", () => {
    it("should validate a correct id", () => {
        expect(notificationPreferenceParamsSchema.safeParse({ id: validId }).success).toBe(true);
    });

    it.each(["invalid", "", "123", "550e8400-e29b-41d4-a716"])("should reject an invalid id: %s", (id) => {
        expect(notificationPreferenceParamsSchema.safeParse({ id }).success).toBe(false);
    });

    it("should reject a missing id", () => {
        expect(notificationPreferenceParamsSchema.safeParse({}).success).toBe(false);
    });

    it("should reject a non-string id", () => {
        expect(notificationPreferenceParamsSchema.safeParse({ id: 123 }).success).toBe(false);
    });
});

describe("listNotificationPreferencesQuerySchema", () => {
    it("should accept an empty query and coerce limit to a number", () => {
        expect(listNotificationPreferencesQuerySchema.safeParse({}).success).toBe(true);
        expect(listNotificationPreferencesQuerySchema.safeParse({ limit: "10" }).success).toBe(true);
    });

    it.each([0, -1, 101, 1.5, "invalid"])("should reject limit %s", (limit) => {
        expect(listNotificationPreferencesQuerySchema.safeParse({ limit }).success).toBe(false);
    });
});

describe("createNotificationPreferenceSchema", () => {
    it("should validate a correct notification preference", () => {
        expect(
            createNotificationPreferenceSchema.safeParse({
                channel: NOTIFICATION_CHANNELS[0],
                category: NOTIFICATION_CATEGORIES[0],
            }).success,
        ).toBe(true);
    });

    it.each(["invalid", "", "email"])("should reject an invalid channel: %s", (channel) => {
        expect(
            createNotificationPreferenceSchema.safeParse({ channel, category: NOTIFICATION_CATEGORIES[0] }).success,
        ).toBe(false);
    });

    it.each(["invalid", "", "unknown"])("should reject an invalid category: %s", (category) => {
        expect(
            createNotificationPreferenceSchema.safeParse({ channel: NOTIFICATION_CHANNELS[0], category }).success,
        ).toBe(false);
    });

    it("should reject a missing channel", () => {
        expect(createNotificationPreferenceSchema.safeParse({ category: NOTIFICATION_CATEGORIES[0] }).success).toBe(
            false,
        );
    });

    it("should reject a missing category", () => {
        expect(createNotificationPreferenceSchema.safeParse({ channel: NOTIFICATION_CHANNELS[0] }).success).toBe(false);
    });

    it("should reject non-string values", () => {
        expect(createNotificationPreferenceSchema.safeParse({ channel: 123, category: 123 }).success).toBe(false);
    });
});

describe("updateNotificationPreferenceSchema", () => {
    it.each([true, false])("should validate enabled as %s", (enabled) => {
        expect(updateNotificationPreferenceSchema.safeParse({ enabled }).success).toBe(true);
    });

    it.each(["true", "false", 1, 0, null])("should reject a non-boolean enabled value: %s", (enabled) => {
        expect(updateNotificationPreferenceSchema.safeParse({ enabled }).success).toBe(false);
    });

    it("should reject a missing enabled field", () => {
        expect(updateNotificationPreferenceSchema.safeParse({}).success).toBe(false);
    });
});

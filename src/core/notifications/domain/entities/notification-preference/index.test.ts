import {
    InvalidNotificationCategoryError,
    InvalidNotificationChannelError,
    NotificationPreferenceOwnerRequiredError,
    NotificationTenantRequiredError,
} from "../../errors";
import {
    NOTIFICATION_CATEGORIES,
    NOTIFICATION_CATEGORY,
    NOTIFICATION_CHANNEL,
    NOTIFICATION_CHANNELS,
} from "../../types";
import { NotificationPreference } from ".";

const baseProps = {
    id: "11111111-1111-1111-1111-111111111111",
    tenantId: "22222222-2222-2222-2222-222222222222",
    ownerId: "33333333-3333-3333-3333-333333333333",
    channel: NOTIFICATION_CHANNEL.EMAIL,
    category: NOTIFICATION_CATEGORY.MARKETING,
    createdAt: new Date("2025-01-01T00:00:00.000Z"),
};

describe("NotificationPreference", () => {
    describe("create", () => {
        it("creates a preference with enabled = true", () => {
            const preference = NotificationPreference.create(baseProps);
            expect(preference.isEnabled()).toBe(true);
            expect(preference.updatedAt).toEqual(baseProps.createdAt);
        });

        it("creates a preference with updatedAt equal to createdAt", () => {
            const preference = NotificationPreference.create(baseProps);
            expect(preference.createdAt).toEqual(baseProps.createdAt);
            expect(preference.updatedAt).toEqual(baseProps.createdAt);
        });

        it("throws when tenantId is empty", () => {
            expect(() => NotificationPreference.create({ ...baseProps, tenantId: "" })).toThrow(
                NotificationTenantRequiredError,
            );
        });

        it("throws when ownerId is empty", () => {
            expect(() => NotificationPreference.create({ ...baseProps, ownerId: "" })).toThrow(
                NotificationPreferenceOwnerRequiredError,
            );
        });

        it("throws when channel is invalid", () => {
            expect(() => NotificationPreference.create({ ...baseProps, channel: "INVALID" as never })).toThrow(
                InvalidNotificationChannelError,
            );
        });

        it("throws when category is invalid", () => {
            expect(() => NotificationPreference.create({ ...baseProps, category: "INVALID" as never })).toThrow(
                InvalidNotificationCategoryError,
            );
        });
    });

    describe("restore", () => {
        const restoredProps = { ...baseProps, enabled: false, updatedAt: new Date("2025-02-01T00:00:00.000Z") };

        it("restores a preference with the provided properties", () => {
            const preference = NotificationPreference.restore(restoredProps);
            expect(preference.id).toBe(restoredProps.id);
            expect(preference.tenantId).toBe(restoredProps.tenantId);
            expect(preference.ownerId).toBe(restoredProps.ownerId);
            expect(preference.channel).toBe(restoredProps.channel);
            expect(preference.category).toBe(restoredProps.category);
            expect(preference.createdAt).toEqual(restoredProps.createdAt);
            expect(preference.updatedAt).toEqual(restoredProps.updatedAt);
            expect(preference.isEnabled()).toBe(false);
        });

        it("throws when tenantId is empty", () => {
            expect(() => NotificationPreference.restore({ ...restoredProps, tenantId: "" })).toThrow(
                NotificationTenantRequiredError,
            );
        });

        it("throws when ownerId is empty", () => {
            expect(() => NotificationPreference.restore({ ...restoredProps, ownerId: "" })).toThrow(
                NotificationPreferenceOwnerRequiredError,
            );
        });

        it("throws when channel is invalid", () => {
            expect(() => NotificationPreference.restore({ ...restoredProps, channel: "INVALID" as never })).toThrow(
                InvalidNotificationChannelError,
            );
        });

        it("throws when category is invalid", () => {
            expect(() => NotificationPreference.restore({ ...restoredProps, category: "INVALID" as never })).toThrow(
                InvalidNotificationCategoryError,
            );
        });
    });

    describe("queries", () => {
        it("isEnabled returns the current enabled state", () => {
            const preference = NotificationPreference.create(baseProps);
            expect(preference.isEnabled()).toBe(true);
            preference.disable();
            expect(preference.isEnabled()).toBe(false);
        });

        it("appliesToChannel returns true when channel matches", () => {
            const preference = NotificationPreference.create(baseProps);
            expect(preference.appliesToChannel(baseProps.channel)).toBe(true);
            const otherChannel = NOTIFICATION_CHANNELS.find((channel) => channel !== baseProps.channel);
            if (otherChannel) {
                expect(preference.appliesToChannel(otherChannel)).toBe(false);
            }
        });

        it("appliesToCategory returns true when category matches", () => {
            const preference = NotificationPreference.create(baseProps);
            expect(preference.appliesToCategory(baseProps.category)).toBe(true);
            const otherCategory = NOTIFICATION_CATEGORIES.find((category) => category !== baseProps.category);
            if (otherCategory) {
                expect(preference.appliesToCategory(otherCategory)).toBe(false);
            }
        });
    });

    describe("enable / disable", () => {
        it("disable sets enabled to false and updates updatedAt", () => {
            const preference = NotificationPreference.create(baseProps);
            const before = new Date();
            preference.disable();
            const after = new Date();
            expect(preference.isEnabled()).toBe(false);
            expect(preference.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
            expect(preference.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
        });

        it("disable is idempotent", () => {
            const preference = NotificationPreference.create(baseProps);
            preference.disable();
            const updatedAt = preference.updatedAt;
            preference.disable();
            expect(preference.isEnabled()).toBe(false);
            expect(preference.updatedAt).toBe(updatedAt);
        });

        it("enable sets enabled to true and updates updatedAt", () => {
            const preference = NotificationPreference.create(baseProps);
            preference.disable();
            const before = new Date();
            preference.enable();
            const after = new Date();
            expect(preference.isEnabled()).toBe(true);
            expect(preference.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
            expect(preference.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
        });

        it("enable is idempotent", () => {
            const preference = NotificationPreference.create(baseProps);
            const updatedAt = preference.updatedAt;
            preference.enable();
            expect(preference.isEnabled()).toBe(true);
            expect(preference.updatedAt).toBe(updatedAt);
        });
    });

    describe("getters", () => {
        it("returns the preference properties", () => {
            const preference = NotificationPreference.create(baseProps);
            expect(preference.id).toBe(baseProps.id);
            expect(preference.tenantId).toBe(baseProps.tenantId);
            expect(preference.ownerId).toBe(baseProps.ownerId);
            expect(preference.channel).toBe(baseProps.channel);
            expect(preference.category).toBe(baseProps.category);
            expect(preference.createdAt).toEqual(baseProps.createdAt);
            expect(preference.updatedAt).toEqual(baseProps.createdAt);
        });
    });
});

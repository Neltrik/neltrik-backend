import type { NotificationPreference as PrismaNotificationPreference } from "@prisma/client";

import { NotificationPreference } from "../../../domain/entities";
import { NOTIFICATION_CATEGORY, NOTIFICATION_CHANNEL } from "../../../domain/types";
import { NotificationPreferenceMapper } from "./index";

jest.mock("sanitize-html", () => jest.fn((html: string) => html));

const createProps = () => {
    const createdAt = new Date("2026-01-15T10:30:00.000Z");
    const updatedAt = new Date("2026-01-15T11:30:00.000Z");
    return {
        id: "preference-id",
        tenantId: "tenant-id",
        ownerId: "owner-id",
        channel: NOTIFICATION_CHANNEL.EMAIL,
        category: NOTIFICATION_CATEGORY.MARKETING,
        enabled: true,
        createdAt,
        updatedAt,
    };
};

describe("NotificationPreferenceMapper", () => {
    it("should map a domain preference to persistence", () => {
        const props = createProps();
        const preference = NotificationPreference.restore(props);
        const persistence = NotificationPreferenceMapper.toPersistence(preference);
        expect(persistence).toEqual({
            id: preference.id,
            tenantId: preference.tenantId,
            ownerId: preference.ownerId,
            channel: preference.channel,
            category: preference.category,
            enabled: preference.isEnabled(),
            createdAt: preference.createdAt,
            updatedAt: preference.updatedAt,
        });
    });

    it("should preserve preference properties when mapping to persistence", () => {
        const props = createProps();
        const preference = NotificationPreference.restore(props);
        const persistence = NotificationPreferenceMapper.toPersistence(preference);
        expect(persistence.id).toBe(props.id);
        expect(persistence.tenantId).toBe(props.tenantId);
        expect(persistence.ownerId).toBe(props.ownerId);
        expect(persistence.channel).toBe(props.channel);
        expect(persistence.category).toBe(props.category);
        expect(persistence.enabled).toBe(props.enabled);
    });

    it("should preserve dates when mapping a domain preference to persistence", () => {
        const props = createProps();
        const preference = NotificationPreference.restore(props);
        const persistence = NotificationPreferenceMapper.toPersistence(preference);
        expect(persistence.createdAt).toBe(props.createdAt);
        expect(persistence.updatedAt).toBe(props.updatedAt);
    });

    it("should map a persistence preference to domain", () => {
        const props = createProps();
        const persistence = { ...props } as unknown as PrismaNotificationPreference;
        const preference = NotificationPreferenceMapper.toDomain(persistence);
        expect(preference).toBeInstanceOf(NotificationPreference);
        expect(preference.id).toBe(persistence.id);
        expect(preference.tenantId).toBe(persistence.tenantId);
        expect(preference.ownerId).toBe(persistence.ownerId);
        expect(preference.channel).toBe(persistence.channel);
        expect(preference.category).toBe(persistence.category);
        expect(preference.isEnabled()).toBe(persistence.enabled);
        expect(preference.createdAt).toEqual(persistence.createdAt);
        expect(preference.updatedAt).toEqual(persistence.updatedAt);
    });

    it("should map a disabled persistence preference to domain", () => {
        const persistence = { ...createProps(), enabled: false } as unknown as PrismaNotificationPreference;
        const preference = NotificationPreferenceMapper.toDomain(persistence);
        expect(preference.isEnabled()).toBe(false);
    });

    it("should map an enabled persistence preference to domain", () => {
        const persistence = { ...createProps(), enabled: true } as unknown as PrismaNotificationPreference;
        const preference = NotificationPreferenceMapper.toDomain(persistence);
        expect(preference.isEnabled()).toBe(true);
    });

    it("should preserve dates when mapping a persistence preference to domain", () => {
        const props = createProps();
        const persistence = { ...props } as unknown as PrismaNotificationPreference;
        const preference = NotificationPreferenceMapper.toDomain(persistence);
        expect(preference.createdAt).toEqual(props.createdAt);
        expect(preference.updatedAt).toEqual(props.updatedAt);
    });

    it("should preserve channel and category when mapping persistence to domain", () => {
        const persistence = {
            ...createProps(),
            channel: NOTIFICATION_CHANNEL.IN_APP,
            category: NOTIFICATION_CATEGORY.TRANSACTIONAL,
        } as unknown as PrismaNotificationPreference;
        const preference = NotificationPreferenceMapper.toDomain(persistence);
        expect(preference.channel).toBe(NOTIFICATION_CHANNEL.IN_APP);
        expect(preference.category).toBe(NOTIFICATION_CATEGORY.TRANSACTIONAL);
    });

    it("should map a disabled domain preference to persistence", () => {
        const preference = NotificationPreference.restore({ ...createProps(), enabled: true });
        preference.disable();
        const persistence = NotificationPreferenceMapper.toPersistence(preference);
        expect(persistence.enabled).toBe(false);
        expect(persistence.updatedAt).toBe(preference.updatedAt);
    });
});

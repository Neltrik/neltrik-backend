import type { Notification as PrismaNotification } from "@prisma/client";

import { Notification } from "../../../domain/entities";
import { NOTIFICATION_CHANNEL, NOTIFICATION_STATUS, type NotificationProps } from "../../../domain/types";
import { NotificationMapper } from "./index";

jest.mock("sanitize-html", () => jest.fn((html: string) => html));

const createProps = (): NotificationProps => {
    const createdAt = new Date("2026-01-15T10:30:00.000Z");
    const updatedAt = new Date("2026-01-15T11:30:00.000Z");
    return {
        id: "notification-id",
        tenantId: "tenant-id",
        recipientId: "recipient-id",
        recipientEmail: "test@example.com",
        code: "WELCOME_CODE",
        channels: [NOTIFICATION_CHANNEL.EMAIL, NOTIFICATION_CHANNEL.IN_APP],
        payload: { key: "value" },
        locale: "es",
        status: NOTIFICATION_STATUS.PENDING,
        attempts: 0,
        lastError: null,
        sentAt: null,
        readAt: null,
        createdAt,
        updatedAt,
    };
};

describe("NotificationMapper", () => {
    it("should map a domain notification to persistence", () => {
        const notification = Notification.restore(createProps());
        const persistence = NotificationMapper.toPersistence(notification);
        expect(persistence).toEqual({
            id: notification.id,
            tenantId: notification.tenantId,
            recipientId: notification.recipientId,
            recipientEmail: notification.recipientEmail,
            code: notification.code,
            status: notification.status,
            channels: [...notification.channels],
            payload: notification.payload,
            locale: notification.locale,
            attempts: notification.attempts,
            lastError: notification.lastError,
            sentAt: notification.sentAt,
            readAt: notification.readAt,
            createdAt: notification.createdAt,
            updatedAt: notification.updatedAt,
        });
    });

    it("should preserve channels array when mapping to persistence", () => {
        const notification = Notification.restore(createProps());
        const persistence = NotificationMapper.toPersistence(notification);
        expect(Array.isArray(persistence.channels)).toBe(true);
        expect(persistence.channels).toEqual(notification.channels);
    });

    it("should preserve dates when mapping a domain notification to persistence", () => {
        const props = createProps();
        const notification = Notification.restore(props);
        const persistence = NotificationMapper.toPersistence(notification);
        expect(persistence.createdAt).toBe(props.createdAt);
        expect(persistence.updatedAt).toBe(props.updatedAt);
    });

    it("should map a persistence notification to domain", () => {
        const props = createProps();
        const persistence = {
            id: props.id,
            tenantId: props.tenantId,
            recipientId: props.recipientId,
            recipientEmail: props.recipientEmail,
            code: props.code,
            status: props.status,
            channels: [...props.channels],
            payload: props.payload,
            locale: props.locale,
            attempts: props.attempts,
            lastError: props.lastError,
            sentAt: props.sentAt,
            readAt: props.readAt,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
        } as unknown as PrismaNotification;
        const notification = NotificationMapper.toDomain(persistence);
        expect(notification).toBeInstanceOf(Notification);
        expect(notification.id).toBe(persistence.id);
        expect(notification.tenantId).toBe(persistence.tenantId);
        expect(notification.recipientId).toBe(persistence.recipientId);
        expect(notification.recipientEmail).toBe(persistence.recipientEmail);
        expect(notification.code).toBe(persistence.code);
        expect(notification.status).toBe(persistence.status);
        expect(notification.channels).toEqual(persistence.channels);
        expect(notification.payload).toEqual(persistence.payload);
        expect(notification.locale).toBe(persistence.locale);
        expect(notification.attempts).toBe(persistence.attempts);
        expect(notification.lastError).toBe(persistence.lastError);
        expect(notification.sentAt).toEqual(persistence.sentAt);
        expect(notification.readAt).toEqual(persistence.readAt);
        expect(notification.createdAt).toEqual(persistence.createdAt);
        expect(notification.updatedAt).toEqual(persistence.updatedAt);
    });

    it("should map persistence values correctly when mapping to domain", () => {
        const persistence = {
            ...createProps(),
            attempts: 3,
            status: NOTIFICATION_STATUS.SENT,
            sentAt: new Date("2026-01-15T12:00:00.000Z"),
        } as unknown as PrismaNotification;
        const notification = NotificationMapper.toDomain(persistence);
        expect(notification.attempts).toBe(3);
        expect(notification.status).toBe(NOTIFICATION_STATUS.SENT);
        expect(notification.sentAt).toEqual(persistence.sentAt);
    });

    it("should preserve dates when mapping a persistence notification to domain", () => {
        const props = createProps();
        const persistence = { ...props } as unknown as PrismaNotification;
        const notification = NotificationMapper.toDomain(persistence);
        expect(notification.createdAt).toEqual(props.createdAt);
        expect(notification.updatedAt).toEqual(props.updatedAt);
    });

    it("should map a notification with null optional fields from persistence to domain", () => {
        const persistence = {
            ...createProps(),
            channels: [NOTIFICATION_CHANNEL.IN_APP],
            recipientEmail: null,
            lastError: null,
            sentAt: null,
            readAt: null,
        } as unknown as PrismaNotification;
        const notification = NotificationMapper.toDomain(persistence);
        expect(notification.recipientEmail).toBeNull();
        expect(notification.lastError).toBeNull();
        expect(notification.sentAt).toBeNull();
        expect(notification.readAt).toBeNull();
    });
});

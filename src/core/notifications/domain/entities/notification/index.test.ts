import {
    InvalidNotificationAttemptsError,
    InvalidNotificationChannelError,
    InvalidNotificationPayloadError,
    InvalidNotificationStatusError,
    InvalidNotificationStatusTransitionError,
    NotificationCannotBeMarkedAsReadError,
    NotificationChannelsRequiredError,
    NotificationCodeRequiredError,
    NotificationLocaleRequiredError,
    NotificationRecipientEmailRequiredError,
    NotificationRecipientRequiredError,
    NotificationTenantRequiredError,
} from "../../errors";
import {
    NOTIFICATION_CHANNEL,
    NOTIFICATION_STATUS,
    type NotificationChannel,
    type NotificationProps,
} from "../../types";
import { Notification } from "./index";

const createProps = (): NotificationProps => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
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
        updatedAt: createdAt,
    };
};

describe("Notification", () => {
    it("should create a notification", () => {
        const props = createProps();
        const {
            status: _status,
            attempts: _attempts,
            lastError: _lastError,
            sentAt: _sentAt,
            readAt: _readAt,
            updatedAt: _updatedAt,
            ...restProps
        } = props;
        const notification = Notification.create(restProps);
        expect(notification.id).toBe(props.id);
        expect(notification.tenantId).toBe(props.tenantId);
        expect(notification.recipientId).toBe(props.recipientId);
        expect(notification.recipientEmail).toBe(props.recipientEmail);
        expect(notification.code).toBe(props.code);
        expect(notification.channels).toEqual(props.channels);
        expect(notification.payload).toEqual(props.payload);
        expect(notification.locale).toBe(props.locale);
        expect(notification.status).toBe(NOTIFICATION_STATUS.PENDING);
        expect(notification.attempts).toBe(0);
        expect(notification.lastError).toBeNull();
        expect(notification.sentAt).toBeNull();
        expect(notification.readAt).toBeNull();
        expect(notification.createdAt).toBe(props.createdAt);
        expect(notification.updatedAt).toBe(props.createdAt);
    });

    it("should restore a notification", () => {
        const props = createProps();
        const notification = Notification.restore(props);
        expect(notification.id).toBe(props.id);
        expect(notification.tenantId).toBe(props.tenantId);
        expect(notification.recipientId).toBe(props.recipientId);
        expect(notification.recipientEmail).toBe(props.recipientEmail);
        expect(notification.code).toBe(props.code);
        expect(notification.channels).toEqual(props.channels);
        expect(notification.payload).toEqual(props.payload);
        expect(notification.locale).toBe(props.locale);
        expect(notification.status).toBe(props.status);
        expect(notification.attempts).toBe(props.attempts);
        expect(notification.lastError).toBe(props.lastError);
        expect(notification.sentAt).toBe(props.sentAt);
        expect(notification.readAt).toBe(props.readAt);
        expect(notification.createdAt).toBe(props.createdAt);
        expect(notification.updatedAt).toBe(props.updatedAt);
    });

    it("should expose all properties through getters", () => {
        const props = createProps();
        const notification = Notification.restore(props);
        expect(notification.id).toBe(props.id);
        expect(notification.tenantId).toBe(props.tenantId);
        expect(notification.recipientId).toBe(props.recipientId);
        expect(notification.recipientEmail).toBe(props.recipientEmail);
        expect(notification.code).toBe(props.code);
        expect(notification.channels).toEqual(props.channels);
        expect(notification.payload).toEqual(props.payload);
        expect(notification.locale).toBe(props.locale);
        expect(notification.status).toBe(props.status);
        expect(notification.attempts).toBe(props.attempts);
        expect(notification.lastError).toBe(props.lastError);
        expect(notification.sentAt).toBe(props.sentAt);
        expect(notification.readAt).toBe(props.readAt);
        expect(notification.createdAt).toBe(props.createdAt);
        expect(notification.updatedAt).toBe(props.updatedAt);
    });
});

describe("Validations", () => {
    it("should throw NotificationTenantRequiredError when tenantId is empty", () => {
        const props = createProps();
        const { tenantId: _tenantId, ...rest } = props;
        expect(() => Notification.restore({ ...rest, tenantId: "" })).toThrow(NotificationTenantRequiredError);
    });

    it("should throw NotificationRecipientRequiredError when recipientId is empty", () => {
        const props = createProps();
        expect(() => Notification.restore({ ...props, recipientId: "" })).toThrow(NotificationRecipientRequiredError);
    });

    it("should throw NotificationCodeRequiredError when code is empty", () => {
        const props = createProps();
        expect(() => Notification.restore({ ...props, code: "" })).toThrow(NotificationCodeRequiredError);
    });

    it("should throw NotificationChannelsRequiredError when channels array is empty", () => {
        const props = createProps();
        expect(() => Notification.restore({ ...props, channels: [] })).toThrow(NotificationChannelsRequiredError);
    });

    it("should throw InvalidNotificationChannelError when channel is invalid", () => {
        const props = createProps();
        const invalidChannel = "INVALID_CHANNEL" as unknown as NotificationChannel;
        expect(() => Notification.restore({ ...props, channels: [invalidChannel] })).toThrow(
            InvalidNotificationChannelError,
        );
    });

    it("should throw NotificationRecipientEmailRequiredError when email channel is present but recipientEmail is missing", () => {
        const props = createProps();
        expect(() =>
            Notification.restore({ ...props, channels: [NOTIFICATION_CHANNEL.EMAIL], recipientEmail: null }),
        ).toThrow(NotificationRecipientEmailRequiredError);
    });

    it.each([
        ["null", null],
        ["array", []],
        ["string", "string"],
        ["number", 123],
    ])("should throw InvalidNotificationPayloadError when payload is %s", (_, payload) => {
        const props = createProps();
        // @ts-expect-error Testing invalid payload types
        expect(() => Notification.restore({ ...props, payload })).toThrow(InvalidNotificationPayloadError);
    });

    it("should throw NotificationLocaleRequiredError when locale is empty", () => {
        const props = createProps();
        expect(() => Notification.restore({ ...props, locale: "" })).toThrow(NotificationLocaleRequiredError);
    });

    it("should throw InvalidNotificationStatusError when status is invalid", () => {
        const props = createProps();
        // @ts-expect-error Testing invalid status
        expect(() => Notification.restore({ ...props, status: "INVALID_STATUS" })).toThrow(
            InvalidNotificationStatusError,
        );
    });

    it.each([
        ["negative number", -1],
        ["decimal number", 1.5],
        ["NaN", Number.NaN],
        ["positive infinity", Number.POSITIVE_INFINITY],
    ])("should throw InvalidNotificationAttemptsError when attempts is %s", (_, attempts) => {
        const props = createProps();
        expect(() => Notification.restore({ ...props, attempts })).toThrow(InvalidNotificationAttemptsError);
    });
});

describe("Mutations & State Transitions", () => {
    it("should register an attempt and update attempts and updatedAt", () => {
        const notification = Notification.restore(createProps());
        const previousUpdatedAt = notification.updatedAt;
        const initialAttempts = notification.attempts;
        notification.registerAttempt();
        expect(notification.attempts).toBe(initialAttempts + 1);
        expect(notification.updatedAt).toBeInstanceOf(Date);
        expect(notification.updatedAt.getTime()).toBeGreaterThanOrEqual(previousUpdatedAt.getTime());
    });

    it("should mark notification as sent", () => {
        const notification = Notification.restore(createProps());
        notification.markAsSent();
        expect(notification.status).toBe(NOTIFICATION_STATUS.SENT);
        expect(notification.sentAt).toBeInstanceOf(Date);
        expect(notification.updatedAt).toBeInstanceOf(Date);
    });

    it("should throw InvalidNotificationStatusTransitionError when marking as sent if already sent", () => {
        const notification = Notification.restore({ ...createProps(), status: NOTIFICATION_STATUS.SENT });
        expect(() => notification.markAsSent()).toThrow(InvalidNotificationStatusTransitionError);
    });

    it("should mark notification as failed with reason", () => {
        const notification = Notification.restore(createProps());
        notification.markAsFailed("Network timeout");
        expect(notification.status).toBe(NOTIFICATION_STATUS.FAILED);
        expect(notification.lastError).toBe("Network timeout");
        expect(notification.updatedAt).toBeInstanceOf(Date);
    });

    it("should throw InvalidNotificationStatusTransitionError when marking as failed if already sent", () => {
        const notification = Notification.restore({ ...createProps(), status: NOTIFICATION_STATUS.SENT });
        expect(() => notification.markAsFailed("Error")).toThrow(InvalidNotificationStatusTransitionError);
    });

    it("should mark notification as read", () => {
        const notification = Notification.restore({ ...createProps(), channels: [NOTIFICATION_CHANNEL.IN_APP] });
        expect(notification.canBeMarkedAsRead()).toBe(true);
        notification.markAsRead();
        expect(notification.readAt).toBeInstanceOf(Date);
        expect(notification.updatedAt).toBeInstanceOf(Date);
    });

    it("should do nothing if notification is already read", () => {
        const readDate = new Date("2025-01-01T01:00:00.000Z");
        const notification = Notification.restore({
            ...createProps(),
            channels: [NOTIFICATION_CHANNEL.IN_APP],
            readAt: readDate,
        });
        notification.markAsRead();
        expect(notification.readAt).toBe(readDate);
    });

    it("should throw NotificationCannotBeMarkedAsReadError when marking as read without IN_APP channel", () => {
        const notification = Notification.restore({ ...createProps(), channels: [NOTIFICATION_CHANNEL.EMAIL] });
        expect(notification.canBeMarkedAsRead()).toBe(false);
        expect(() => notification.markAsRead()).toThrow(NotificationCannotBeMarkedAsReadError);
    });
});

describe("Notification helpers", () => {
    it("should return true when notification is pending", () => {
        const notification = Notification.restore({ ...createProps(), status: NOTIFICATION_STATUS.PENDING });
        expect(notification.isPending()).toBe(true);
        expect(notification.isSent()).toBe(false);
        expect(notification.isFailed()).toBe(false);
    });

    it("should return true when notification is sent", () => {
        const notification = Notification.restore({ ...createProps(), status: NOTIFICATION_STATUS.SENT });
        expect(notification.isSent()).toBe(true);
        expect(notification.isPending()).toBe(false);
    });

    it("should return true when notification is failed", () => {
        const notification = Notification.restore({ ...createProps(), status: NOTIFICATION_STATUS.FAILED });
        expect(notification.isFailed()).toBe(true);
        expect(notification.isPending()).toBe(false);
    });

    it("should check if channel is included", () => {
        const notification = Notification.restore({ ...createProps(), channels: [NOTIFICATION_CHANNEL.EMAIL] });
        expect(notification.includesChannel(NOTIFICATION_CHANNEL.EMAIL)).toBe(true);
        expect(notification.includesChannel(NOTIFICATION_CHANNEL.IN_APP)).toBe(false);
    });
});

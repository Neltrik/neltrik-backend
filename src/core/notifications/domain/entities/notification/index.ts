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
    NOTIFICATION_CHANNELS,
    NOTIFICATION_STATUS,
    NOTIFICATION_STATUSES,
    type NotificationChannel,
    type NotificationPayload,
    type NotificationProps,
    type NotificationStatus,
} from "../../types";

export class Notification {
    private props: NotificationProps;

    private constructor(props: NotificationProps) {
        this.ensureTenantIdIsValid(props.tenantId);
        this.ensureRecipientIdIsValid(props.recipientId);
        this.ensureCodeIsValid(props.code);
        this.ensureChannelsAreValid(props.channels);
        this.ensureRecipientEmailMatchesChannels(props);
        this.ensurePayloadIsValid(props.payload);
        this.ensureLocaleIsValid(props.locale);
        this.ensureStatusIsValid(props.status);
        this.ensureAttemptsIsValid(props.attempts);
        this.props = props;
    }

    public static create(
        props: Omit<NotificationProps, "status" | "attempts" | "lastError" | "sentAt" | "readAt" | "updatedAt">,
    ): Notification {
        return new Notification({
            ...props,
            status: NOTIFICATION_STATUS.PENDING,
            attempts: 0,
            lastError: null,
            sentAt: null,
            readAt: null,
            updatedAt: props.createdAt,
        });
    }

    public static restore(props: NotificationProps): Notification {
        return new Notification(props);
    }

    private ensureTenantIdIsValid(tenantId: string): void {
        if (!tenantId) {
            throw new NotificationTenantRequiredError();
        }
    }

    private ensureRecipientIdIsValid(recipientId: string): void {
        if (!recipientId) {
            throw new NotificationRecipientRequiredError();
        }
    }

    private ensureCodeIsValid(code: string): void {
        if (!code) {
            throw new NotificationCodeRequiredError();
        }
    }

    private ensureChannelsAreValid(channels: readonly NotificationChannel[]): void {
        if (channels.length === 0) {
            throw new NotificationChannelsRequiredError();
        }
        const invalid = channels.filter((channel) => !NOTIFICATION_CHANNELS.includes(channel));
        if (invalid.length > 0) {
            throw new InvalidNotificationChannelError();
        }
    }

    private ensureRecipientEmailMatchesChannels(props: NotificationProps): void {
        if (props.channels.includes(NOTIFICATION_CHANNEL.EMAIL) && !props.recipientEmail) {
            throw new NotificationRecipientEmailRequiredError();
        }
    }

    private ensurePayloadIsValid(payload: unknown): void {
        if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
            throw new InvalidNotificationPayloadError();
        }
    }

    private ensureLocaleIsValid(locale: string): void {
        if (!locale) {
            throw new NotificationLocaleRequiredError();
        }
    }

    private ensureStatusIsValid(status: NotificationStatus): void {
        if (!NOTIFICATION_STATUSES.includes(status)) {
            throw new InvalidNotificationStatusError();
        }
    }

    private ensureAttemptsIsValid(attempts: number): void {
        if (!Number.isInteger(attempts) || attempts < 0) {
            throw new InvalidNotificationAttemptsError();
        }
    }

    public isPending(): boolean {
        return this.props.status === NOTIFICATION_STATUS.PENDING;
    }

    public isSent(): boolean {
        return this.props.status === NOTIFICATION_STATUS.SENT;
    }

    public isFailed(): boolean {
        return this.props.status === NOTIFICATION_STATUS.FAILED;
    }

    public includesChannel(channel: NotificationChannel): boolean {
        return this.props.channels.includes(channel);
    }

    public canBeMarkedAsRead(): boolean {
        return this.includesChannel(NOTIFICATION_CHANNEL.IN_APP) && this.props.readAt === null;
    }

    public registerAttempt(): void {
        this.props.attempts += 1;
        this.props.updatedAt = new Date();
    }

    public markAsSent(): void {
        if (this.isSent()) {
            throw new InvalidNotificationStatusTransitionError();
        }
        this.props.status = NOTIFICATION_STATUS.SENT;
        this.props.sentAt = new Date();
        this.props.updatedAt = new Date();
    }

    public markAsFailed(reason: string): void {
        if (this.isSent()) {
            throw new InvalidNotificationStatusTransitionError();
        }
        this.props.status = NOTIFICATION_STATUS.FAILED;
        this.props.lastError = reason;
        this.props.updatedAt = new Date();
    }

    public markAsRead(): void {
        if (!this.includesChannel(NOTIFICATION_CHANNEL.IN_APP)) {
            throw new NotificationCannotBeMarkedAsReadError();
        }
        if (this.props.readAt !== null) {
            return;
        }
        this.props.readAt = new Date();
        this.props.updatedAt = new Date();
    }

    public get id(): string {
        return this.props.id;
    }

    public get tenantId(): string {
        return this.props.tenantId;
    }

    public get recipientId(): string {
        return this.props.recipientId;
    }

    public get recipientEmail(): string | null {
        return this.props.recipientEmail;
    }

    public get code(): string {
        return this.props.code;
    }

    public get channels(): readonly NotificationChannel[] {
        return this.props.channels;
    }

    public get payload(): NotificationPayload {
        return this.props.payload;
    }

    public get locale(): string {
        return this.props.locale;
    }

    public get status(): NotificationStatus {
        return this.props.status;
    }

    public get attempts(): number {
        return this.props.attempts;
    }

    public get lastError(): string | null {
        return this.props.lastError;
    }

    public get sentAt(): Date | null {
        return this.props.sentAt;
    }

    public get readAt(): Date | null {
        return this.props.readAt;
    }

    public get createdAt(): Date {
        return this.props.createdAt;
    }

    public get updatedAt(): Date {
        return this.props.updatedAt;
    }
}

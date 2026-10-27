import {
    InvalidNotificationCategoryError,
    InvalidNotificationChannelError,
    NotificationPreferenceOwnerRequiredError,
    NotificationTenantRequiredError,
} from "../../errors";
import {
    NOTIFICATION_CATEGORIES,
    NOTIFICATION_CHANNELS,
    type NotificationCategory,
    type NotificationChannel,
    type NotificationPreferenceProps,
} from "../../types";

export class NotificationPreference {
    private props: NotificationPreferenceProps;

    private constructor(props: NotificationPreferenceProps) {
        this.ensureTenantIdIsValid(props.tenantId);
        this.ensureOwnerIdIsValid(props.ownerId);
        this.ensureChannelIsValid(props.channel);
        this.ensureCategoryIsValid(props.category);
        this.props = props;
    }

    public static create(props: Omit<NotificationPreferenceProps, "enabled" | "updatedAt">): NotificationPreference {
        return new NotificationPreference({ ...props, enabled: true, updatedAt: props.createdAt });
    }

    public static restore(props: NotificationPreferenceProps): NotificationPreference {
        return new NotificationPreference(props);
    }

    private ensureTenantIdIsValid(tenantId: string): void {
        if (!tenantId) {
            throw new NotificationTenantRequiredError();
        }
    }

    private ensureOwnerIdIsValid(ownerId: string): void {
        if (!ownerId) {
            throw new NotificationPreferenceOwnerRequiredError();
        }
    }

    private ensureChannelIsValid(channel: NotificationChannel): void {
        if (!NOTIFICATION_CHANNELS.includes(channel)) {
            throw new InvalidNotificationChannelError();
        }
    }

    private ensureCategoryIsValid(category: NotificationCategory): void {
        if (!NOTIFICATION_CATEGORIES.includes(category)) {
            throw new InvalidNotificationCategoryError();
        }
    }

    public isEnabled(): boolean {
        return this.props.enabled;
    }

    public appliesToChannel(channel: NotificationChannel): boolean {
        return this.props.channel === channel;
    }

    public appliesToCategory(category: NotificationCategory): boolean {
        return this.props.category === category;
    }

    public enable(): void {
        if (this.props.enabled) {
            return;
        }
        this.props.enabled = true;
        this.props.updatedAt = new Date();
    }

    public disable(): void {
        if (!this.props.enabled) {
            return;
        }
        this.props.enabled = false;
        this.props.updatedAt = new Date();
    }

    public get id(): string {
        return this.props.id;
    }

    public get tenantId(): string {
        return this.props.tenantId;
    }

    public get ownerId(): string {
        return this.props.ownerId;
    }

    public get channel(): NotificationChannel {
        return this.props.channel;
    }

    public get category(): NotificationCategory {
        return this.props.category;
    }

    public get createdAt(): Date {
        return this.props.createdAt;
    }

    public get updatedAt(): Date {
        return this.props.updatedAt;
    }
}

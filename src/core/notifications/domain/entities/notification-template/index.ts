import { NOTIFICATION_CODES } from "../../catalogs";
import {
    InvalidNotificationTemplateChannelError,
    InvalidNotificationTemplateCodeError,
    InvalidNotificationTemplateLocaleError,
    NotificationTemplateBodyRequiredError,
    NotificationTemplateCodeRequiredError,
    NotificationTemplateLocaleRequiredError,
    NotificationTemplateSubjectRequiredError,
} from "../../errors";
import type { NotificationTemplateProps } from "../../types";
import {
    NOTIFICATION_CHANNEL,
    NOTIFICATION_CHANNELS,
    NOTIFICATION_TEMPLATE_LOCALE_REGEX,
    type NotificationChannel,
} from "../../types";

export class NotificationTemplate {
    private props: NotificationTemplateProps;

    private constructor(props: NotificationTemplateProps) {
        this.ensureCodeIsValid(props.code);
        this.ensureChannelIsValid(props.channel);
        this.ensureLocaleIsValid(props.locale);
        this.ensureSubjectMatchesChannel(props);
        this.ensureBodyIsValid(props.body);
        this.props = props;
    }

    public static create(props: Omit<NotificationTemplateProps, "isActive" | "updatedAt">): NotificationTemplate {
        return new NotificationTemplate({ ...props, isActive: true, updatedAt: props.createdAt });
    }

    public static restore(props: NotificationTemplateProps): NotificationTemplate {
        return new NotificationTemplate(props);
    }

    private ensureCodeIsValid(code: string): void {
        if (!code) {
            throw new NotificationTemplateCodeRequiredError();
        }
        const validCodes: readonly string[] = Object.values(NOTIFICATION_CODES);
        if (!validCodes.includes(code)) {
            throw new InvalidNotificationTemplateCodeError();
        }
    }

    private ensureChannelIsValid(channel: NotificationChannel): void {
        if (!NOTIFICATION_CHANNELS.includes(channel)) {
            throw new InvalidNotificationTemplateChannelError();
        }
    }

    private ensureLocaleIsValid(locale: string): void {
        if (!locale) {
            throw new NotificationTemplateLocaleRequiredError();
        }
        if (!NOTIFICATION_TEMPLATE_LOCALE_REGEX.test(locale)) {
            throw new InvalidNotificationTemplateLocaleError();
        }
    }

    private ensureSubjectMatchesChannel(props: NotificationTemplateProps): void {
        if (props.channel === NOTIFICATION_CHANNEL.EMAIL && !props.subject) {
            throw new NotificationTemplateSubjectRequiredError();
        }
    }

    private ensureBodyIsValid(body: string): void {
        if (!body) {
            throw new NotificationTemplateBodyRequiredError();
        }
    }

    public isActive(): boolean {
        return this.props.isActive;
    }

    public appliesToChannel(channel: NotificationChannel): boolean {
        return this.props.channel === channel;
    }

    public appliesToLocale(locale: string): boolean {
        return this.props.locale === locale;
    }

    public appliesToTenant(tenantId: string | null): boolean {
        return this.props.tenantId === tenantId;
    }

    public activate(): void {
        if (this.props.isActive) {
            return;
        }
        this.props.isActive = true;
        this.props.updatedAt = new Date();
    }

    public desactivate(): void {
        if (!this.props.isActive) {
            return;
        }
        this.props.isActive = false;
        this.props.updatedAt = new Date();
    }

    public updateContent(subject: string | null, body: string): void {
        if (this.props.channel === NOTIFICATION_CHANNEL.EMAIL && !subject) {
            throw new NotificationTemplateSubjectRequiredError();
        }
        this.ensureBodyIsValid(body);
        this.props.subject = subject;
        this.props.body = body;
        this.props.updatedAt = new Date();
    }

    public hasConflict(other: NotificationTemplate): boolean {
        if (other.id === this.props.id) {
            return false;
        }
        if (!other.isActive()) {
            return false;
        }
        return (
            other.code === this.props.code &&
            other.channel === this.props.channel &&
            other.locale === this.props.locale &&
            other.tenantId === this.props.tenantId
        );
    }

    public get id(): string {
        return this.props.id;
    }

    public get tenantId(): string | null {
        return this.props.tenantId;
    }

    public get code(): string {
        return this.props.code;
    }

    public get channel(): NotificationChannel {
        return this.props.channel;
    }

    public get locale(): string {
        return this.props.locale;
    }

    public get subject(): string | null {
        return this.props.subject;
    }

    public get body(): string {
        return this.props.body;
    }

    public get createdAt(): Date {
        return this.props.createdAt;
    }

    public get updatedAt(): Date {
        return this.props.updatedAt;
    }
}

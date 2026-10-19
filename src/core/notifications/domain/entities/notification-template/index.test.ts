import {
    InvalidNotificationTemplateChannelError,
    NotificationTemplateBodyRequiredError,
    NotificationTemplateCodeRequiredError,
    NotificationTemplateLocaleRequiredError,
    NotificationTemplateSubjectRequiredError,
} from "../../errors";
import { NOTIFICATION_CHANNEL, type NotificationChannel, type NotificationTemplateProps } from "../../types";
import { NotificationTemplate } from "./index";

const createProps = (): NotificationTemplateProps => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    return {
        id: "notification-template-id",
        tenantId: "tenant-id",
        code: "WELCOME_CODE",
        channel: NOTIFICATION_CHANNEL.EMAIL,
        locale: "es",
        subject: "Welcome!",
        body: "Welcome to our platform.",
        isActive: true,
        createdAt,
        updatedAt: createdAt,
    };
};

describe("NotificationTemplate", () => {
    it("should create a notification template", () => {
        const props = createProps();
        const { isActive: _isActive, updatedAt: _updatedAt, ...restProps } = props;
        const template = NotificationTemplate.create(restProps);
        expect(template.id).toBe(props.id);
        expect(template.tenantId).toBe(props.tenantId);
        expect(template.code).toBe(props.code);
        expect(template.channel).toBe(props.channel);
        expect(template.locale).toBe(props.locale);
        expect(template.subject).toBe(props.subject);
        expect(template.body).toBe(props.body);
        expect(template.isActive()).toBe(true);
        expect(template.createdAt).toBe(props.createdAt);
        expect(template.updatedAt).toBe(props.createdAt);
    });

    it("should restore a notification template", () => {
        const props = createProps();
        const template = NotificationTemplate.restore(props);
        expect(template.id).toBe(props.id);
        expect(template.tenantId).toBe(props.tenantId);
        expect(template.code).toBe(props.code);
        expect(template.channel).toBe(props.channel);
        expect(template.locale).toBe(props.locale);
        expect(template.subject).toBe(props.subject);
        expect(template.body).toBe(props.body);
        expect(template.isActive()).toBe(props.isActive);
        expect(template.createdAt).toBe(props.createdAt);
        expect(template.updatedAt).toBe(props.updatedAt);
    });

    it("should expose all properties through getters", () => {
        const props = createProps();
        const template = NotificationTemplate.restore(props);
        expect(template.id).toBe(props.id);
        expect(template.tenantId).toBe(props.tenantId);
        expect(template.code).toBe(props.code);
        expect(template.channel).toBe(props.channel);
        expect(template.locale).toBe(props.locale);
        expect(template.subject).toBe(props.subject);
        expect(template.body).toBe(props.body);
        expect(template.createdAt).toBe(props.createdAt);
        expect(template.updatedAt).toBe(props.updatedAt);
    });

    it("should create an active template with updatedAt equal to createdAt", () => {
        const props = createProps();
        const { isActive: _isActive, updatedAt: _updatedAt, ...restProps } = props;
        const template = NotificationTemplate.create(restProps);
        expect(template.isActive()).toBe(true);
        expect(template.updatedAt).toBe(template.createdAt);
    });
});

describe("Validations", () => {
    it("should throw NotificationTemplateCodeRequiredError when code is empty", () => {
        const props = createProps();
        expect(() => NotificationTemplate.restore({ ...props, code: "" })).toThrow(
            NotificationTemplateCodeRequiredError,
        );
    });

    it("should throw InvalidNotificationTemplateChannelError when channel is invalid", () => {
        const props = createProps();
        const invalidChannel = "INVALID_CHANNEL" as unknown as NotificationChannel;
        expect(() => NotificationTemplate.restore({ ...props, channel: invalidChannel })).toThrow(
            InvalidNotificationTemplateChannelError,
        );
    });

    it("should throw NotificationTemplateLocaleRequiredError when locale is empty", () => {
        const props = createProps();
        expect(() => NotificationTemplate.restore({ ...props, locale: "" })).toThrow(
            NotificationTemplateLocaleRequiredError,
        );
    });

    it("should throw NotificationTemplateSubjectRequiredError when email subject is empty", () => {
        const props = createProps();
        expect(() => NotificationTemplate.restore({ ...props, subject: "" })).toThrow(
            NotificationTemplateSubjectRequiredError,
        );
    });

    it("should throw NotificationTemplateSubjectRequiredError when email subject is null", () => {
        const props = createProps();
        expect(() => NotificationTemplate.restore({ ...props, subject: null })).toThrow(
            NotificationTemplateSubjectRequiredError,
        );
    });

    it("should allow an empty subject for non-email channels", () => {
        const props = createProps();
        const template = NotificationTemplate.restore({
            ...props,
            channel: NOTIFICATION_CHANNEL.IN_APP,
            subject: null,
        });
        expect(template.subject).toBeNull();
        expect(template.channel).toBe(NOTIFICATION_CHANNEL.IN_APP);
    });

    it("should throw NotificationTemplateBodyRequiredError when body is empty", () => {
        const props = createProps();
        expect(() => NotificationTemplate.restore({ ...props, body: "" })).toThrow(
            NotificationTemplateBodyRequiredError,
        );
    });
});

describe("NotificationTemplate helpers", () => {
    it("should return true when the template is active", () => {
        const template = NotificationTemplate.restore({ ...createProps(), isActive: true });
        expect(template.isActive()).toBe(true);
    });

    it("should return false when the template is inactive", () => {
        const template = NotificationTemplate.restore({ ...createProps(), isActive: false });
        expect(template.isActive()).toBe(false);
    });

    it("should check if the template applies to a channel", () => {
        const template = NotificationTemplate.restore({ ...createProps(), channel: NOTIFICATION_CHANNEL.EMAIL });
        expect(template.appliesToChannel(NOTIFICATION_CHANNEL.EMAIL)).toBe(true);
        expect(template.appliesToChannel(NOTIFICATION_CHANNEL.IN_APP)).toBe(false);
    });

    it("should check if the template applies to a locale", () => {
        const template = NotificationTemplate.restore({ ...createProps(), locale: "es" });
        expect(template.appliesToLocale("es")).toBe(true);
        expect(template.appliesToLocale("en")).toBe(false);
    });

    it("should check if the template applies to a tenant", () => {
        const template = NotificationTemplate.restore({ ...createProps(), tenantId: "tenant-id" });
        expect(template.appliesToTenant("tenant-id")).toBe(true);
        expect(template.appliesToTenant("another-tenant-id")).toBe(false);
        expect(template.appliesToTenant(null)).toBe(false);
    });

    it("should apply to a null tenant when tenantId is null", () => {
        const template = NotificationTemplate.restore({ ...createProps(), tenantId: null });
        expect(template.appliesToTenant(null)).toBe(true);
        expect(template.appliesToTenant("tenant-id")).toBe(false);
    });
});

describe("Mutations & State Transitions", () => {
    it("should activate an inactive template and update updatedAt", () => {
        const template = NotificationTemplate.restore({ ...createProps(), isActive: false });
        const previousUpdatedAt = template.updatedAt;
        template.activate();
        expect(template.isActive()).toBe(true);
        expect(template.updatedAt).toBeInstanceOf(Date);
        expect(template.updatedAt.getTime()).toBeGreaterThanOrEqual(previousUpdatedAt.getTime());
    });

    it("should do nothing when activating an already active template", () => {
        const props = createProps();
        const template = NotificationTemplate.restore(props);
        const previousUpdatedAt = template.updatedAt;
        template.activate();
        expect(template.isActive()).toBe(true);
        expect(template.updatedAt).toBe(previousUpdatedAt);
    });

    it("should desactivate an active template and update updatedAt", () => {
        const template = NotificationTemplate.restore({ ...createProps(), isActive: true });
        const previousUpdatedAt = template.updatedAt;
        template.desactivate();
        expect(template.isActive()).toBe(false);
        expect(template.updatedAt).toBeInstanceOf(Date);
        expect(template.updatedAt.getTime()).toBeGreaterThanOrEqual(previousUpdatedAt.getTime());
    });

    it("should do nothing when deactivating an already inactive template", () => {
        const props = createProps();
        const template = NotificationTemplate.restore({ ...props, isActive: false });
        const previousUpdatedAt = template.updatedAt;
        template.desactivate();
        expect(template.isActive()).toBe(false);
        expect(template.updatedAt).toBe(previousUpdatedAt);
    });

    it("should update template content", () => {
        const template = NotificationTemplate.restore(createProps());
        const previousUpdatedAt = template.updatedAt;
        template.updateContent("New subject", "New body");
        expect(template.subject).toBe("New subject");
        expect(template.body).toBe("New body");
        expect(template.updatedAt).toBeInstanceOf(Date);
        expect(template.updatedAt.getTime()).toBeGreaterThanOrEqual(previousUpdatedAt.getTime());
    });

    it("should allow a null subject when updating a non-email template", () => {
        const template = NotificationTemplate.restore({
            ...createProps(),
            channel: NOTIFICATION_CHANNEL.IN_APP,
            subject: null,
        });
        template.updateContent(null, "Updated in-app body");
        expect(template.subject).toBeNull();
        expect(template.body).toBe("Updated in-app body");
        expect(template.updatedAt).toBeInstanceOf(Date);
    });

    it("should throw NotificationTemplateSubjectRequiredError when updating email content without a subject", () => {
        const template = NotificationTemplate.restore(createProps());
        expect(() => template.updateContent(null, "New body")).toThrow(NotificationTemplateSubjectRequiredError);
    });

    it("should throw NotificationTemplateSubjectRequiredError when updating email content with an empty subject", () => {
        const template = NotificationTemplate.restore(createProps());
        expect(() => template.updateContent("", "New body")).toThrow(NotificationTemplateSubjectRequiredError);
    });

    it("should throw NotificationTemplateBodyRequiredError when updating content with an empty body", () => {
        const template = NotificationTemplate.restore(createProps());
        expect(() => template.updateContent("New subject", "")).toThrow(NotificationTemplateBodyRequiredError);
    });

    it("should not update content when validation fails", () => {
        const props = createProps();
        const template = NotificationTemplate.restore(props);
        expect(() => template.updateContent(null, "New body")).toThrow(NotificationTemplateSubjectRequiredError);
        expect(template.subject).toBe(props.subject);
        expect(template.body).toBe(props.body);
        expect(template.updatedAt).toBe(props.updatedAt);
    });

    it("should not update content when body validation fails", () => {
        const props = createProps();
        const template = NotificationTemplate.restore(props);
        expect(() => template.updateContent("New subject", "")).toThrow(NotificationTemplateBodyRequiredError);
        expect(template.subject).toBe(props.subject);
        expect(template.body).toBe(props.body);
        expect(template.updatedAt).toBe(props.updatedAt);
    });
});

describe("hasConflict", () => {
    it("should return true when another active template has the same combination", () => {
        const props = createProps();
        const a = NotificationTemplate.create(props);
        const b = NotificationTemplate.create({ ...props, id: "other-id" });
        expect(a.hasConflict(b)).toBe(true);
    });

    it("should return false when templates have the same id", () => {
        const template = NotificationTemplate.create(createProps());
        expect(template.hasConflict(template)).toBe(false);
    });

    it("should return false when either template is inactive", () => {
        const props = createProps();
        const activeTemplate = NotificationTemplate.create(props);
        const inactiveTemplate = NotificationTemplate.create({ ...props, id: "other-id" });
        inactiveTemplate.desactivate();
        expect(activeTemplate.hasConflict(inactiveTemplate)).toBe(false);
        expect(inactiveTemplate.hasConflict(activeTemplate)).toBe(false);
    });

    it("should return false when templates have different combinations", () => {
        const props = createProps();
        const template = NotificationTemplate.create(props);
        const differentCode = NotificationTemplate.create({ ...props, id: "other-code", code: "OTHER_CODE" });
        const differentChannel = NotificationTemplate.create({
            ...props,
            id: "other-channel",
            channel: NOTIFICATION_CHANNEL.IN_APP,
            subject: null,
        });
        const differentLocale = NotificationTemplate.create({ ...props, id: "other-locale", locale: "en" });
        const differentTenant = NotificationTemplate.create({
            ...props,
            id: "other-tenant",
            tenantId: "another-tenant-id",
        });
        expect(template.hasConflict(differentCode)).toBe(false);
        expect(template.hasConflict(differentChannel)).toBe(false);
        expect(template.hasConflict(differentLocale)).toBe(false);
        expect(template.hasConflict(differentTenant)).toBe(false);
    });

    it("should return true when global templates have the same combination", () => {
        const props = { ...createProps(), tenantId: null };
        const a = NotificationTemplate.create(props);
        const b = NotificationTemplate.create({ ...props, id: "other-id" });
        expect(a.hasConflict(b)).toBe(true);
    });
});

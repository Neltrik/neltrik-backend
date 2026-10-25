import { NOTIFICATION_CODES, type NotificationCode } from "../../catalogs";
import {
    InvalidNotificationTemplateChannelError,
    InvalidNotificationTemplateCodeError,
    InvalidNotificationTemplateLocaleError,
    InvalidTemplateVariableError,
    NotificationTemplateBodyRequiredError,
    NotificationTemplateCodeRequiredError,
    NotificationTemplateLocaleRequiredError,
    NotificationTemplateSubjectRequiredError,
} from "../../errors";
import { NOTIFICATION_CHANNEL, type NotificationChannel, type NotificationTemplateProps } from "../../types";
import { NotificationTemplate } from "./index";

const VALID_CODES: string[] = Object.values(NOTIFICATION_CODES);

const createProps = (): NotificationTemplateProps => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    return {
        id: "notification-template-id",
        tenantId: "tenant-id",
        code: VALID_CODES[0] as NotificationCode,
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
    it("should create and restore a template", () => {
        const props = createProps();
        const { isActive: _active, updatedAt: _updated, ...rest } = props;
        const created = NotificationTemplate.create(rest);
        const restored = NotificationTemplate.restore(props);
        expect(created.id).toBe(props.id);
        expect(created.isActive()).toBe(true);
        expect(created.updatedAt).toBe(props.createdAt);
        expect(restored.body).toBe(props.body);
        expect(restored.updatedAt).toBe(props.updatedAt);
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

    describe("validations", () => {
        it("should reject an empty code", () => {
            expect(() => NotificationTemplate.restore({ ...createProps(), code: "" as NotificationCode })).toThrow(
                NotificationTemplateCodeRequiredError,
            );
        });

        it("should reject an invalid code", () => {
            expect(() =>
                NotificationTemplate.restore({ ...createProps(), code: "INVALID_CODE" as NotificationCode }),
            ).toThrow(InvalidNotificationTemplateCodeError);
        });

        it("should reject an invalid channel", () => {
            expect(() =>
                NotificationTemplate.restore({
                    ...createProps(),
                    channel: "INVALID" as unknown as NotificationChannel,
                }),
            ).toThrow(InvalidNotificationTemplateChannelError);
        });

        it("should reject an empty locale", () => {
            expect(() => NotificationTemplate.restore({ ...createProps(), locale: "" })).toThrow(
                NotificationTemplateLocaleRequiredError,
            );
        });

        it("should reject an invalid locale format", () => {
            expect(() => NotificationTemplate.restore({ ...createProps(), locale: "invalid_locale!" })).toThrow(
                InvalidNotificationTemplateLocaleError,
            );
        });

        it("should require a subject for email templates", () => {
            expect(() => NotificationTemplate.restore({ ...createProps(), subject: null })).toThrow(
                NotificationTemplateSubjectRequiredError,
            );
        });

        it("should allow a null subject for non-email templates", () => {
            const template = NotificationTemplate.restore({
                ...createProps(),
                channel: NOTIFICATION_CHANNEL.IN_APP,
                subject: null,
            });
            expect(template.subject).toBeNull();
        });

        it("should reject an empty body", () => {
            expect(() => NotificationTemplate.restore({ ...createProps(), body: "" })).toThrow(
                NotificationTemplateBodyRequiredError,
            );
        });

        it("should reject invalid variables in the body", () => {
            expect(() =>
                NotificationTemplate.restore({
                    ...createProps(),
                    body: "Welcome {{invalidVariable}}!",
                }),
            ).toThrow(InvalidTemplateVariableError);
        });
    });

    describe("helpers", () => {
        it("should match channel, locale and tenant", () => {
            const template = NotificationTemplate.restore(createProps());
            expect(template.appliesToChannel(NOTIFICATION_CHANNEL.EMAIL)).toBe(true);
            expect(template.appliesToChannel(NOTIFICATION_CHANNEL.IN_APP)).toBe(false);
            expect(template.appliesToLocale("es")).toBe(true);
            expect(template.appliesToLocale("en")).toBe(false);
            expect(template.appliesToTenant("tenant-id")).toBe(true);
            expect(template.appliesToTenant(null)).toBe(false);
        });

        it("should support global templates", () => {
            const template = NotificationTemplate.restore({ ...createProps(), tenantId: null });
            expect(template.appliesToTenant(null)).toBe(true);
        });

        it("should activate and deactivate a template", () => {
            const template = NotificationTemplate.restore({ ...createProps(), isActive: false });
            const previousUpdatedAt = template.updatedAt;
            template.activate();
            expect(template.isActive()).toBe(true);
            expect(template.updatedAt.getTime()).toBeGreaterThanOrEqual(previousUpdatedAt.getTime());
            template.desactivate();
            expect(template.isActive()).toBe(false);
        });

        it("should not change updatedAt for redundant state transitions", () => {
            const template = NotificationTemplate.restore(createProps());
            const updatedAt = template.updatedAt;
            template.activate();
            expect(template.updatedAt).toBe(updatedAt);
            template.desactivate();
            const deactivatedAt = template.updatedAt;
            template.desactivate();
            expect(template.updatedAt).toBe(deactivatedAt);
        });
    });

    describe("updateContent", () => {
        it("should update subject, body and updatedAt", () => {
            const template = NotificationTemplate.restore(createProps());
            template.updateContent("New subject", "New body");
            expect(template.subject).toBe("New subject");
            expect(template.body).toBe("New body");
            expect(template.updatedAt).toBeInstanceOf(Date);
        });

        it("should allow a null subject for non-email templates", () => {
            const template = NotificationTemplate.restore({
                ...createProps(),
                channel: NOTIFICATION_CHANNEL.IN_APP,
                subject: null,
            });
            template.updateContent(null, "Updated body");
            expect(template.subject).toBeNull();
            expect(template.body).toBe("Updated body");
        });

        it.each([
            [null, "New body", NotificationTemplateSubjectRequiredError],
            ["", "New body", NotificationTemplateSubjectRequiredError],
            ["New subject", "", NotificationTemplateBodyRequiredError],
        ])("should reject invalid content", (subject, body, ErrorClass) => {
            const props = createProps();
            const template = NotificationTemplate.restore(props);
            expect(() => template.updateContent(subject, body)).toThrow(ErrorClass);
            expect(template.subject).toBe(props.subject);
            expect(template.body).toBe(props.body);
            expect(template.updatedAt).toBe(props.updatedAt);
        });
    });

    describe("hasConflict", () => {
        it("should detect a conflict for matching active templates", () => {
            const props = createProps();
            const template = NotificationTemplate.restore(props);
            const other = NotificationTemplate.restore({ ...props, id: "other-id" });
            expect(template.hasConflict(other)).toBe(true);
        });

        it("should ignore templates with the same ID", () => {
            const template = NotificationTemplate.restore(createProps());
            expect(template.hasConflict(template)).toBe(false);
        });

        it("should ignore an inactive other template", () => {
            const props = createProps();
            const template = NotificationTemplate.restore(props);
            const other = NotificationTemplate.restore({ ...props, id: "other-id", isActive: false });
            expect(template.hasConflict(other)).toBe(false);
        });

        it("should detect conflict even if this template is inactive", () => {
            const props = createProps();
            const template = NotificationTemplate.restore({ ...props, isActive: false });
            const other = NotificationTemplate.restore({ ...props, id: "other-id" });
            expect(template.hasConflict(other)).toBe(true);
        });

        it.each([
            ["channel", { channel: NOTIFICATION_CHANNEL.IN_APP, subject: null }],
            ["locale", { locale: "en" }],
            ["tenant", { tenantId: "another-tenant" }],
        ])("should return false for a different %s", (_name, changes) => {
            const props = createProps();
            const template = NotificationTemplate.restore(props);
            const other = NotificationTemplate.restore({ ...props, id: "other-id", ...changes });
            expect(template.hasConflict(other)).toBe(false);
        });

        it("should return false for a different valid code", () => {
            const props = createProps();
            const differentCode = VALID_CODES.find((code) => code !== props.code);
            if (differentCode === undefined) {
                return;
            }
            const template = NotificationTemplate.restore(props);
            const other = NotificationTemplate.restore({
                ...props,
                id: "other-id",
                code: differentCode as NotificationCode,
            });
            expect(template.hasConflict(other)).toBe(false);
        });

        it("should detect conflicts between global templates", () => {
            const props = { ...createProps(), tenantId: null };
            const template = NotificationTemplate.restore(props);
            const other = NotificationTemplate.restore({ ...props, id: "other-id" });
            expect(template.hasConflict(other)).toBe(true);
        });
    });
});

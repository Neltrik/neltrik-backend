import type { NotificationTemplate as PrismaNotificationTemplate } from "@prisma/client";

import { NotificationTemplate } from "../../../domain/entities";
import { NOTIFICATION_CHANNEL, type NotificationTemplateProps } from "../../../domain/types";
import { NotificationTemplateMapper } from "./index";

const createProps = (): NotificationTemplateProps => {
    const createdAt = new Date("2026-01-15T10:30:00.000Z");
    const updatedAt = new Date("2026-01-15T11:30:00.000Z");
    return {
        id: "notification-template-id",
        tenantId: "tenant-id",
        code: "WELCOME",
        channel: NOTIFICATION_CHANNEL.EMAIL,
        locale: "es",
        subject: "Welcome!",
        body: "Welcome to our platform.",
        isActive: true,
        createdAt,
        updatedAt,
    };
};

describe("NotificationTemplateMapper", () => {
    it("should map a domain notification template to persistence", () => {
        const template = NotificationTemplate.restore(createProps());
        const persistence = NotificationTemplateMapper.toPersistence(template);
        expect(persistence).toEqual({
            id: template.id,
            tenantId: template.tenantId,
            code: template.code,
            channel: template.channel,
            locale: template.locale,
            subject: template.subject,
            body: template.body,
            isActive: template.isActive(),
            createdAt: template.createdAt,
            updatedAt: template.updatedAt,
        });
    });

    it("should preserve all template properties when mapping to persistence", () => {
        const props = createProps();
        const template = NotificationTemplate.restore(props);
        const persistence = NotificationTemplateMapper.toPersistence(template);
        expect(persistence.id).toBe(props.id);
        expect(persistence.tenantId).toBe(props.tenantId);
        expect(persistence.code).toBe(props.code);
        expect(persistence.channel).toBe(props.channel);
        expect(persistence.locale).toBe(props.locale);
        expect(persistence.subject).toBe(props.subject);
        expect(persistence.body).toBe(props.body);
        expect(persistence.isActive).toBe(props.isActive);
    });

    it("should preserve dates when mapping a domain notification template to persistence", () => {
        const props = createProps();
        const template = NotificationTemplate.restore(props);
        const persistence = NotificationTemplateMapper.toPersistence(template);
        expect(persistence.createdAt).toBe(props.createdAt);
        expect(persistence.updatedAt).toBe(props.updatedAt);
    });

    it("should map a persistence notification template to domain", () => {
        const props = createProps();
        const persistence = { ...props } as PrismaNotificationTemplate;
        const template = NotificationTemplateMapper.toDomain(persistence);
        expect(template).toBeInstanceOf(NotificationTemplate);
        expect(template.id).toBe(persistence.id);
        expect(template.tenantId).toBe(persistence.tenantId);
        expect(template.code).toBe(persistence.code);
        expect(template.channel).toBe(persistence.channel);
        expect(template.locale).toBe(persistence.locale);
        expect(template.subject).toBe(persistence.subject);
        expect(template.body).toBe(persistence.body);
        expect(template.isActive()).toBe(persistence.isActive);
        expect(template.createdAt).toEqual(persistence.createdAt);
        expect(template.updatedAt).toEqual(persistence.updatedAt);
    });

    it("should map persistence values correctly when mapping to domain", () => {
        const props = createProps();
        const persistence = {
            ...props,
            subject: "Updated subject",
            body: "Updated body",
            isActive: false,
        } as PrismaNotificationTemplate;
        const template = NotificationTemplateMapper.toDomain(persistence);
        expect(template.subject).toBe("Updated subject");
        expect(template.body).toBe("Updated body");
        expect(template.isActive()).toBe(false);
    });

    it("should preserve dates when mapping a persistence notification template to domain", () => {
        const props = createProps();
        const persistence = { ...props } as PrismaNotificationTemplate;
        const template = NotificationTemplateMapper.toDomain(persistence);
        expect(template.createdAt).toEqual(props.createdAt);
        expect(template.updatedAt).toEqual(props.updatedAt);
    });

    it("should map an inactive notification template from persistence to domain", () => {
        const props = createProps();
        const persistence = { ...props, isActive: false } as PrismaNotificationTemplate;
        const template = NotificationTemplateMapper.toDomain(persistence);
        expect(template.isActive()).toBe(false);
    });

    it("should map a notification template with a null tenantId from persistence to domain", () => {
        const props = createProps();
        const persistence = { ...props, tenantId: null } as PrismaNotificationTemplate;
        const template = NotificationTemplateMapper.toDomain(persistence);
        expect(template.tenantId).toBeNull();
    });

    it("should map a notification template with a null subject from persistence to domain", () => {
        const props = createProps();
        const persistence = {
            ...props,
            channel: NOTIFICATION_CHANNEL.IN_APP,
            subject: null,
        } as PrismaNotificationTemplate;
        const template = NotificationTemplateMapper.toDomain(persistence);
        expect(template.subject).toBeNull();
        expect(template.channel).toBe(NOTIFICATION_CHANNEL.IN_APP);
    });
});

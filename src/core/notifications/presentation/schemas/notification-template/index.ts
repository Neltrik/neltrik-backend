import { z } from "zod";

import { paginationQuerySchema } from "@/shared/pagination";

import { NOTIFICATION_CODES } from "../../../domain/catalogs";
import { NOTIFICATION_CHANNELS, NOTIFICATION_TEMPLATE_LOCALE_REGEX } from "../../../domain/types";

export const createNotificationTemplateSchema = z
    .object({
        code: z.enum(Object.values(NOTIFICATION_CODES) as [string, ...string[]]),
        channel: z.enum(Object.values(NOTIFICATION_CHANNELS) as [string, ...string[]]),
        locale: z.string().regex(NOTIFICATION_TEMPLATE_LOCALE_REGEX, "locale must be BCP-47 (e.g. es-CO, en-US)"),
        subject: z.string().max(255).nullable(),
        body: z.string().min(1),
        targetTenantId: z.uuid().nullable(),
    })
    .refine((data) => data.channel !== "EMAIL" || (data.subject !== null && data.subject.length > 0), {
        message: "subject is required when channel is EMAIL",
        path: ["subject"],
    });

export const updateNotificationTemplateParamsSchema = z.object({
    id: z.uuid(),
});

export const updateNotificationTemplateSchema = z.object({
    subject: z.string().max(255).nullable(),
    body: z.string().min(1),
});

export const activateNotificationTemplateParamsSchema = z.object({
    id: z.uuid(),
});

export const desactivateNotificationTemplateParamsSchema = z.object({
    id: z.uuid(),
});

export const getNotificationTemplateParamsSchema = z.object({
    id: z.uuid(),
});

export const listNotificationTemplatesQuerySchema = paginationQuerySchema;

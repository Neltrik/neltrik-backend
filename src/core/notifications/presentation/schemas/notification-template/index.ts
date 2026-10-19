import { z } from "zod";

import { paginationQuerySchema } from "@/shared/pagination";

import { NOTIFICATION_CHANNELS } from "../../../domain/types";

export const createNotificationTemplateSchema = z
    .object({
        code: z.string().min(1).max(100),
        channel: z.enum(Object.values(NOTIFICATION_CHANNELS) as [string, ...string[]]),
        locale: z.string().min(1).max(10),
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

export const deactivateNotificationTemplateParamsSchema = z.object({
    id: z.uuid(),
});

export const getNotificationTemplateParamsSchema = z.object({
    id: z.uuid(),
});

export const listNotificationTemplatesQuerySchema = paginationQuerySchema;

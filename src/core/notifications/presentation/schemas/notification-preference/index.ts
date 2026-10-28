import { z } from "zod";

import { paginationQuerySchema } from "@/shared/pagination";

import { NOTIFICATION_CATEGORIES, NOTIFICATION_CHANNELS } from "../../../domain/types";

export const listNotificationPreferencesQuerySchema = paginationQuerySchema;

export const createNotificationPreferenceSchema = z.object({
    channel: z.enum(NOTIFICATION_CHANNELS as [string, ...string[]]),
    category: z.enum(NOTIFICATION_CATEGORIES as [string, ...string[]]),
});

export const updateNotificationPreferenceSchema = z.object({
    enabled: z.boolean(),
});

export const notificationPreferenceParamsSchema = z.object({
    id: z.uuid(),
});

import { z } from "zod";

export const createTenantSchema = z.object({
    name: z.string().trim().min(1).max(255),
});

export const getTenantSchema = z.object({
    id: z.uuid(),
});

export const updateTenantParamsSchema = z.object({
    id: z.uuid(),
});

export const updateTenantSchema = z.object({
    name: z.string().trim().min(1).max(255),
});

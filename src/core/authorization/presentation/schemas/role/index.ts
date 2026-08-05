import { z } from "zod";

export const createRoleSchema = z.object({
    code: z.string().trim().min(1).max(100),
    defaultDisplayName: z.string().trim().min(1).max(100),
    description: z.string().trim().min(1),
});

export const updateRoleSchema = z
    .object({
        defaultDisplayName: z.string().trim().min(1).max(100).optional(),
        description: z.string().trim().min(1).optional(),
    })
    .refine((data) => data.defaultDisplayName !== undefined || data.description !== undefined, {
        message: "At least one field must be provided.",
    });

export const roleParamsSchema = z.object({
    id: z.string().uuid(),
});

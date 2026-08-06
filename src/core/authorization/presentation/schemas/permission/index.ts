import { z } from "zod";

export const createPermissionSchema = z.object({
    code: z.string().trim().min(1).max(150),
    description: z.string().trim().min(1),
});

export const updatePermissionSchema = z
    .object({
        description: z.string().trim().min(1).optional(),
    })
    .refine((data) => data.description !== undefined, {
        message: "At least one field must be provided.",
    });

export const permissionParamsSchema = z.object({
    id: z.uuid(),
});

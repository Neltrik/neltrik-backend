import { z } from "zod";

import { PERMISSION_SCOPE } from "../../../domain/types";

export const createPermissionSchema = z.object({
    code: z.string().trim().min(1).max(150),
    description: z.string().trim().min(1),
    scope: z.enum(PERMISSION_SCOPE),
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

export const userHasPermissionQuerySchema = z.object({
    code: z.string().min(1, "Permission code is required"),
});

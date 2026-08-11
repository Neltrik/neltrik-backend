import { z } from "zod";

import { ROLE_SCOPE } from "../../../domain/types";

export const createRoleSchema = z.object({
    code: z.string().trim().min(1).max(100),
    defaultDisplayName: z.string().trim().min(1).max(100),
    description: z.string().trim().min(1),
    scope: z.enum(ROLE_SCOPE),
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
    id: z.uuid(),
});

export const assignPermissionsToRoleSchema = z.object({
    permissionIds: z.array(z.uuid()).min(1).max(100),
});

export const removePermissionsFromRoleSchema = z.object({
    permissionIds: z.array(z.uuid()).min(1).max(100),
});

export const rolePermissionParamsSchema = z.object({
    id: z.uuid(),
});

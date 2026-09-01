import { z } from "zod";

export const updateUserParamsSchema = z.object({
    id: z.uuid(),
});

export const updateUserSchema = z
    .object({
        firstName: z.string().trim().min(1).max(100).optional(),
        lastName: z.string().trim().min(1).max(100).optional(),
        roleId: z.uuid().optional(),
    })
    .refine((data) => data.firstName !== undefined || data.lastName !== undefined || data.roleId !== undefined, {
        message: "At least one field must be provided.",
    });

export const getUsersParamsSchema = z.object({
    tenantId: z.uuid(),
});

export const suspendUserParamsSchema = z.object({
    id: z.uuid(),
});

export const reactivateUserParamsSchema = z.object({
    id: z.uuid(),
});

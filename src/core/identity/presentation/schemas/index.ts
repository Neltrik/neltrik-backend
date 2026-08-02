import { z } from "zod";

export const registerUserSchema = z.object({
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    email: z.email(),
    tenantId: z.uuid(),
    roleId: z.uuid(),
});

export const updateUserParamsSchema = z.object({
    id: z.uuid(),
});

export const updateUserSchema = z
    .object({
        firstName: z.string().trim().min(1).max(100).optional(),
        lastName: z.string().trim().min(1).max(100).optional(),
        roleId: z.string().uuid().optional(),
    })
    .refine((data) => data.firstName !== undefined || data.lastName !== undefined || data.roleId !== undefined, {
        message: "At least one field must be provided.",
    });

export const getUsersParamsSchema = z.object({
    tenantId: z.uuid(),
});

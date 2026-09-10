import { z } from "zod";

export const changeRoleUserParamsSchema = z.object({
    id: z.uuid(),
});

export const changeRoleUserSchema = z.object({
    roleId: z.uuid(),
});

export const suspendUserParamsSchema = z.object({
    id: z.uuid(),
});

export const reactivateUserParamsSchema = z.object({
    id: z.uuid(),
});

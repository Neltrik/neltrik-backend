import { z } from "zod";

export const createTenantRoleConfigurationSchema = z.object({
    roleId: z.uuid(),
    displayName: z.string().trim().min(1).max(100),
});

export const updateTenantRoleConfigurationSchema = z.object({
    displayName: z.string().trim().min(1).max(100),
});

export const tenantRoleConfigurationParamsSchema = z.object({
    id: z.uuid(),
});

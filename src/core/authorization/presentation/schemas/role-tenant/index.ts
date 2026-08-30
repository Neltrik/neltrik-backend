import { z } from "zod";

export const associateRolesToTenantSchema = z.object({
    roleIds: z.array(z.uuid()).min(1).max(100),
});

export const disassociateRolesFromTenantSchema = z.object({
    roleIds: z.array(z.uuid()).min(1).max(100),
});

export const roleTenantParamsSchema = z.object({
    tenantId: z.uuid(),
});

import { z } from "zod";

import { TENANT_TYPE } from "../../../domain/types";

export const createTenantSchema = z.object({
    name: z.string().trim().min(1).max(255),
    type: z.enum(TENANT_TYPE),
    ownerFirstName: z.string().trim().min(1).max(255),
    ownerLastName: z.string().trim().min(1).max(255),
    ownerEmail: z.string().trim().email().max(255),
    ownerRoleId: z.uuid(),
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

export const suspendTenantParamsSchema = z.object({
    id: z.uuid(),
});

export const reactivateTenantParamsSchema = z.object({
    id: z.uuid(),
});

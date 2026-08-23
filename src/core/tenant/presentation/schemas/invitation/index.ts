import { z } from "zod";

export const createInvitationSchema = z.object({
    tenantId: z.uuid(),
    roleId: z.uuid(),
    recipient: z.string().trim().min(1).max(255),
    mechanism: z.string().trim().min(1).max(50),
});

export const validateInvitationQuerySchema = z.object({
    token: z.string().trim().min(1),
});

export const revokeInvitationParamsSchema = z.object({
    token: z.string().trim().min(1),
});

export const listInvitationsParamsSchema = z.object({
    tenantId: z.uuid(),
});

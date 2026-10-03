import { z } from "zod";

export const adjustQuotaLimitParamsSchema = z.object({
    tenantId: z.uuid(),
});

export const adjustQuotaLimitSchema = z.object({
    newLimitBytes: z.int().positive(),
});

import { z } from "zod";

export const revokeSessionParamsSchema = z.object({
    id: z.uuid("Invalid session ID format"),
});

export const sessionParamsSchema = z.object({
    id: z.uuid("Invalid session ID format"),
});
